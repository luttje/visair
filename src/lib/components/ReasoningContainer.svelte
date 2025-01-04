<script lang="ts">
	import TextAreaEntry from './TextAreaEntry.svelte';
	import Button from './Button.svelte';
	import type { AssistantThread } from '$lib/assistants/AssistantThread';
	import type { AssistantClient } from '$lib/assistants/AssistantClient';
	import GroupTitle from './Chat/GroupTitle.svelte';
	import ChatMessage from './Chat/ChatMessage.svelte';
	import { getRandomColor } from '$lib/Utilities';
	import { threadStore, getSender } from '$lib/assistants/ThreadStore.svelte';
	import { onMount } from 'svelte';
	import ProgressText from './ProgressText.svelte';

	type Props = {
		thread: AssistantThread;
		client: AssistantClient;
	};

	let { thread, client, ...attrs }: Props = $props();

	let userInput = $state('');
	let isLoading = $state(false);
	let messages = $state(thread.messages);
	let scrollContainer: HTMLDivElement;
	let currentProgressText = $state('');

	// Watch the threadStore for changes and update the messages
	$effect(() => {
		const updatedThread = $threadStore.get(thread.id);

		if (updatedThread) {
			messages = thread.messages;

			// We have to wait a frame for the scroll to be updated
			setTimeout(() => {
				scrollToBottom();
			}, 0);
		}
	});

	const scrollToBottom = () => {
		scrollContainer.scroll({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});
	};

	const ensureColorSet = () => {
		if (!thread.config.color) {
			threadStore.update((store) => {
				thread.config.color = getRandomColor();
				return store;
			});
		}
	};

	$effect(ensureColorSet);
	ensureColorSet();

	const sendMessage = async () => {
		if (!thread) return;

		if (!userInput.trim() || isLoading) return;

		isLoading = true;

		try {
			const messageId = await client.addUserMessage(thread.id, userInput);

			threadStore.update((store) => {
				thread.messages.push({
					id: messageId,
					content: userInput,
					sender: 'user',
					timestamp: new Date().toISOString()
				});

				return store;
			});

			await client.streamRun(thread.id, thread.assistantId, {
				onProgressText(progressText) {
					currentProgressText = progressText;
				},
				onComplete() {
					console.log('client.streamRun | Run completed');
				},
				onError(error) {
					console.error('client.streamRun | Error running assistant:', error);
				},
				onMessageCreated(assistantId: string, messageId: string) {
          const message = thread.messages.findLast((m) => m.id === messageId);

          if (message) {
            console.warn('client.streamRun | Message already exists:', messageId, thread.messages);
            return;
          }

					threadStore.update((store) => {
						thread.messages.push({
							id: messageId,
							content: '',
							sender: assistantId,
							timestamp: new Date().toISOString()
						});

						return store;
					});
				},
				onMessageDelta(messageId: string, delta: string) {
					threadStore.update((store) => {
            // Slice the message and re-add it so that Svelte can detect the change
            const messageIndex = thread.messages.findIndex((m) => m.id === messageId);
            const message = thread.messages[messageIndex];

            if (message) {
              message.content = message.content + delta;
            } else {
              console.error('client.streamRun | Message not found:', messageId, thread.messages, thread.messages.map(m => m.id));
            }

            return store;
					});
				},
				onToolCallCreated(toolCall) {
					console.log('client.streamRun | Tool call created:', toolCall);
				},
				onToolCallDelta(delta, snapshot) {
					console.log('client.streamRun | Tool call delta:', delta, snapshot);
				}
			});

			userInput = '';
		} catch (error) {
			console.error('Error sending message:', error);
			// Handle error appropriately
		} finally {
			isLoading = false;
		}
	};

	onMount(() => {
		scrollToBottom();
	});
</script>

<div
	class="flex h-[500px] w-96 flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
	{...attrs}
>
	<GroupTitle title={thread.config.name} description={thread.config.description} />

	<div class="flex flex-1 flex-col space-y-4 overflow-y-auto p-4" bind:this={scrollContainer}>
		{#each messages as message (message.timestamp)}
			<ChatMessage
				content={message.content}
				sender={getSender(message.sender)}
				timestamp={message.timestamp}
				isOwn={message.sender === 'user'}
			/>
		{/each}
	</div>

	<div>
		{#if currentProgressText}
			<div class="p-4">
				<ProgressText>{currentProgressText}</ProgressText>
			</div>
		{/if}
		<div class="border-t border-slate-700 bg-slate-900 p-4">
			<div class="flex gap-2">
				<TextAreaEntry
					bind:value={userInput}
					placeholder="Type your message..."
					disabled={isLoading}
					rows={2}
					onkeyup={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							sendMessage();
              e.preventDefault();
						} else if (e.key === 'ArrowUp' && e.shiftKey) {
              // Test string for quick testing
              userInput = 'What is 2+2?';
            }
					}}
				/>
				<Button primary disabled={isLoading || !userInput.trim()} onclick={sendMessage}>
					Send
				</Button>
			</div>
		</div>
	</div>
</div>
