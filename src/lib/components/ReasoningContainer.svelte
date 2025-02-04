<script lang="ts">
	import TextAreaEntry from './TextAreaEntry.svelte';
	import Button from './Button.svelte';
	import { createThreadHash, type AssistantThread } from '$lib/assistants/AssistantThread';
	import type { AssistantClient } from '$lib/assistants/AssistantClient';
	import GroupTitle from './Chat/GroupTitle.svelte';
	import ChatMessage from './Chat/ChatMessage.svelte';
	import { getRandomColor, testUserInput } from '$lib/Utilities';
	import { threadStore, getSender } from '$lib/assistants/ThreadStore.svelte';
	import { onMount } from 'svelte';
	import ProgressText from './ProgressText.svelte';
	import Heading from './Heading.svelte';
	import { marked } from 'marked';
	import Entry from './Entry.svelte';

	type Props = {
		thread: AssistantThread;
		client: AssistantClient;
		withChat?: boolean;
    class?: string;
	};

	let { thread, client, withChat = false, class: className, ...attrs }: Props = $props();

	let userInput = $state('');
	let isLoading = $state(false);
	let showDebugInfo = $state(false);
	let showDebugInfoTab = $state('system-prompt');
	let debugActionRunId = $state('');
	let messages = $state(thread.messages);
	let isScrollingProgrammatically = $state(false);
	let lastScrollByUser = $state(0);
	let lastThreadHash = $state('');
	let scrollContainer: HTMLDivElement;
	let progressText = $state('');

	// Watch the threadStore for changes and update the messages
	$effect(() => {
		const updatedThread = $threadStore.get(thread.id);

		if (updatedThread) {
			const updatedThreadHash = createThreadHash(updatedThread);

			if (lastThreadHash === updatedThreadHash) {
				return;
			}

			lastThreadHash = updatedThreadHash;

			messages = thread.messages;
			progressText = updatedThread.progressText || '';

			// We have to wait a frame for the scroll to be updated
			setTimeout(() => {
				scrollToBottom();
			}, 0);
		}
	});

  let lastScrollTimeout: number;
	const scrollToBottom = () => {
		if (Date.now() - lastScrollByUser < 1000) {
			// User scrolled, don't take control
			return;
		}

		isScrollingProgrammatically = true;

    if (lastScrollTimeout) {
      clearTimeout(lastScrollTimeout);
    }

		scrollContainer.scroll({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});

		lastScrollTimeout = setTimeout(() => {
			isScrollingProgrammatically = false;
		}, 500);
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
			const messageId = await client.addMessage(thread.id, {
				role: 'user',
				content: userInput
			});

			threadStore.update((store) => {
				thread.messages.push({
					id: messageId,
					content: userInput,
					sender: 'user',
					timestamp: new Date().toISOString()
				});

				return store;
			});

			await client.streamRun(thread.id, thread.assistantId);

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
  class={['flex', 'h-[500px]', 'w-96', 'flex-col', 'overflow-hidden', 'rounded-lg', 'border', 'border-slate-700', 'bg-slate-800', className].join(' ')}
	{...attrs}
>
	<GroupTitle
		title={`${thread.config.avatar || ''} ${thread.config.name}`}
		description={thread.config.description}
	>
		<div slot="actions">
			<button
				aria-label="Show debug info"
				title="Show debug info"
				onclick={() => (showDebugInfo = !showDebugInfo)}
				class="cursor-pointer opacity-35 transition-transform hover:scale-125"
			>
				{#if showDebugInfo}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</GroupTitle>
	{#if progressText}
		<div class="px-4 py-2">
			<ProgressText>{progressText}</ProgressText>
		</div>
	{/if}

	<div
		class="flex flex-1 flex-col space-y-4 overflow-y-auto p-4"
		bind:this={scrollContainer}
		onscroll={() => {
			if (isScrollingProgrammatically) {
				return;
			}

			lastScrollByUser = Date.now();
		}}
	>
		{#if showDebugInfo}
			<div class="flex flex-col space-y-4">
				<div class="flex gap-2">
					<Button
						primary={showDebugInfoTab === 'system-prompt'}
						onclick={() => (showDebugInfoTab = 'system-prompt')}
					>
						System Prompt
					</Button>
					<Button
						primary={showDebugInfoTab === 'debug-actions'}
						onclick={() => (showDebugInfoTab = 'debug-actions')}
					>
						Debug Info
					</Button>
				</div>
				{#if showDebugInfoTab === 'system-prompt'}
					<Heading level={3} class="text-emerald-400">System Prompt</Heading>
					<div class="marked-container text-slate-300">
						{@html marked(thread.config.instructions)}
					</div>
				{:else if showDebugInfoTab === 'debug-actions'}
					<Heading level={3} class="text-emerald-400">Debug Actions</Heading>
					<div>
						<Button onclick={() => console.log(client.getMessages(thread.id))}
							>Log Thread Messages to Console</Button
						>
					</div>
					<div>
						<Button onclick={() => console.log(client.getRuns(thread.id))}
							>Log Thread Runs to Console</Button
						>
					</div>
					<div>
						<Entry title="Run ID" bind:value={debugActionRunId} />
						<Button onclick={() => console.log(client.getRunSteps(thread.id, debugActionRunId))}
							>Log Run Steps to Console</Button
						>
					</div>
				{/if}
			</div>
		{:else}
			{#each messages as message (message.timestamp)}
				<ChatMessage
					content={message.content}
					sender={getSender(message.sender)}
					timestamp={message.timestamp}
					isOwn={message.sender === 'user'}
				/>
			{/each}
		{/if}
	</div>

	{#if withChat}
		<div>
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
								userInput = testUserInput;
							}
						}}
					/>
					<Button primary disabled={isLoading || !userInput.trim()} onclick={sendMessage}>
						Send
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
