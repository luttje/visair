<script lang="ts">
	import type { AssistantThread } from '$lib/assistants/AssistantThread';
	import { AssistantClient } from '$lib/assistants/AssistantClient';
	import ReasoningContainer from './ReasoningContainer.svelte';
	import { apiKey } from '$lib/assistants/ApiKeyStore';
	import EmptyState from './EmptyState.svelte';
	import { threadStore, addThreadToStore, getSender } from '$lib/assistants/ThreadStore.svelte';
	import { createPersonaFunctionName, projectLeadAssistant, sendInstructionsFunctionName } from '$lib/assistants/configs/projectLeadAssistant';
	import Button from './Button.svelte';
	import Container from './Container.svelte';
	import { browser } from '$app/environment';
	import type { AssistantConfig } from '$lib/assistants/AssistantConfig';
	import Label from './Label.svelte';
	import { onMount } from 'svelte';
	import TextAreaEntry from './TextAreaEntry.svelte';
	import Checkbox from './Checkbox.svelte';
	import InfoBulb from './InfoBulb.svelte';
	import type { PreprocessingResult } from '$lib/assistants/Preprocessing';

	type Props = {};

	let { ...attrs }: Props = $props();

	const client = $apiKey ? new AssistantClient($apiKey) : null;
	let cachedProjectLead: AssistantConfig | null = $state(null);
  let preprocessingResults: PreprocessingResult[] = $state([
    {
      preprocessor: 'Preprocessing Step 1',
      result: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo nesciunt nemo voluptas labore veniam, cum excepturi vitae perspiciatis modi rem nisi nobis? Cum, ipsum omnis est neque natus perferendis ducimus!',
      color: 'bg-amber-400',
    },
    {
      preprocessor: 'Preprocessing Step 2',
      result: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo nesciunt nemo voluptas labore veniam, cum excepturi vitae perspiciatis modi rem nisi nobis? Cum, ipsum omnis est neque natus perferendis ducimus!',
      color: 'bg-emerald-400',
    },
    {
      preprocessor: 'Preprocessing Step 3',
      result: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo nesciunt nemo voluptas labore veniam, cum excepturi vitae perspiciatis modi rem nisi nobis? Cum, ipsum omnis est neque natus perferendis ducimus!',
      color: 'bg-rose-400',
    }
  ]);
	let enableCustomInstructions: boolean = $state(false);
	let customInstructions: string = $state(projectLeadAssistant.instructions);
	let isLoading: boolean = $state(false);
	let userInput: string = $state('');

	onMount(() => {
		if (browser) {
			const cachedData = localStorage.getItem('projectLeadAssistant');

			if (!cachedData) return;

			cachedProjectLead = JSON.parse(cachedData) as AssistantConfig;
			customInstructions = cachedProjectLead.instructions;
		}
	});

  const handleCreatePersona = async(personaId: string, name: string, emoji: string, expertise: string, instructions: string): Promise<string> => {
		if (!client) throw new Error('Client not initialized');
    
    console.log('Creating persona', personaId, name, emoji, expertise, instructions);
    
    const assistantConfig = {
      personaId: personaId,
      name: name,
      avatar: emoji,
      description: expertise,
      instructions: instructions,
    };
    const assistantId = await client.createAssistant(assistantConfig);
    
    const assistant = {
      ...assistantConfig,
      id: assistantId,
    };

    console.log('Created persona', personaId, assistantId);

    // Create a thread for the persona
    const threadId = await client.createThread();

    addThreadToStore({
			id: threadId,
			assistantId,
			config: assistant,
      messages: [],
    });
    
    // Add the instructions to the thread
    const role = 'user'; // the user is the project lead asking the persona to do something
    const messageId = await client.addMessage(threadId, role, instructions);

    threadStore.update((store) => {
      const thread = store.get(threadId);

      if (!thread) {
        throw new Error(`Thread not found: ${threadId}`);
      }

      thread.messages.push({
        id: messageId,
        content: instructions,
        sender: role,
        timestamp: new Date().toISOString()
      });

      return store;
    });

    const textResult = await client.streamRun(threadId, assistantId);

    return textResult;
  }

  const handleSendInstructions = async (personaId: string, instructions: string) => {
		if (!client) throw new Error('Client not initialized');

    console.log('Sending instructions to persona', personaId, instructions);

    const threads = $threadStore;
    const thread = threads.entries().find(([threadId, thread]) => thread.config.personaId === personaId);

    if (!thread) {
      console.error('Thread not found for personaId:', personaId, threads);
      throw new Error('Thread not found');
    }

    const threadId = thread[0];
    const messageId = await client.addMessage(threadId, 'user', instructions);

    threadStore.update((store) => {
      const thread = store.get(threadId);

      if (!thread) {
        throw new Error(`Thread not found: ${threadId}`);
      }

      thread.messages.push({
        id: messageId,
        content: instructions,
        sender: 'user',
        timestamp: new Date().toISOString()
      });

      return store;
    });

    const textResult = await client.streamRun(threadId, thread[1].assistantId);

    return textResult;
  }

	$effect(() => {
		if (!client) return;

		client.setCallbacks({
			onProgressText(threadId: string, progressText) {
				const thread = $threadStore.get(threadId);

				if (!thread) {
					console.error('onProgressText | Thread not found:', threadId, $threadStore);
					return;
				}

				threadStore.update((store) => {
					thread.progressText = progressText;
					return store;
				});
			},

      async onHandleToolCall(threadId: string, name: string, parameters: any): Promise<string | undefined> {
        if (name === createPersonaFunctionName) {
          const { personaId, name, emoji, expertise, instructions } = parameters;

          return await handleCreatePersona(personaId, name, emoji, expertise, instructions);
        } else if (name === sendInstructionsFunctionName) {
          const { personaId, instructions } = parameters;

          return await handleSendInstructions(personaId, instructions);
        }

        return undefined;
      },

			onComplete(threadId: string) {
				console.log('onComplete | Run completed', threadId);
				isLoading = false;
			},

			onError(threadId: string, error) {
				console.error('onError | Error running assistant:', threadId, error);
			},

			onMessageCreated(threadId: string, assistantId: string, messageId: string) {
				const thread = $threadStore.get(threadId);

				if (!thread) {
					console.error('onMessageCreated | Thread not found:', threadId, $threadStore);
					return;
				}

				const message = thread.messages.findLast((m) => m.id === messageId);

				if (message) {
					console.warn('onMessageCreated | Message already exists:', messageId, thread.messages);
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

			onMessageDelta(threadId: string, messageId: string, delta: string) {
				const thread = $threadStore.get(threadId);

				if (!thread) {
					console.error('onMessageDelta | Thread not found:', threadId, $threadStore);
					return;
				}

				threadStore.update((store) => {
					// Slice the message and re-add it so that Svelte can detect the change
					const messageIndex = thread.messages.findIndex((m) => m.id === messageId);
					const message = thread.messages[messageIndex];

					if (message) {
						message.content = message.content + delta;
					} else {
						console.error(
							'onMessageDelta | Message not found:',
							messageId,
							thread.messages,
							thread.messages.map((m) => m.id)
						);
					}

					return store;
				});
			}
		});
	});

	const start = async () => {
		if (!client) return;

		// Force clean if custom instructions are enabled, so that the new assistant can be created
		if (enableCustomInstructions && cachedProjectLead) {
			forceClearCachedProjectLead(client);
		}

		if (browser && cachedProjectLead) {
			const threadId = await client.createThread();

			addThreadToStore({
				id: threadId,
				assistantId: cachedProjectLead.id,
				config: cachedProjectLead,
				messages: []
			});

			return;
		}

		const assistantConfig = {
			...projectLeadAssistant
		};

		if (enableCustomInstructions) {
			assistantConfig.instructions = customInstructions;
		}

		const assistantId = await client.createAssistant(assistantConfig);
		const assistant: AssistantConfig = {
			...assistantConfig,
			id: assistantId
		};

		if (browser) {
			localStorage.setItem('projectLeadAssistant', JSON.stringify(assistant));
			cachedProjectLead = assistant;
		}

		const threadId = await client.createThread();

		addThreadToStore({
			id: threadId,
			assistantId,
			config: assistant,
			messages: []
		});
	};

	const forceClearThreads = async (client: AssistantClient) => {
		const threads = $threadStore;

		try {
			for (const [threadId, thread] of threads) {
				await client.deleteThread(threadId);
			}
		} finally {
			threadStore.set(new Map());
		}
	};

	const clearThreads = async () => {
		if (!client) return;

		if (confirm('Are you sure you want to remove all threads? This cannot be undone.')) {
			forceClearThreads(client);
		}
	};

	const forceClearCachedProjectLead = async (client: AssistantClient) => {
		if (browser) localStorage.removeItem('projectLeadAssistant');

		if (!cachedProjectLead) return;

		const assistantRemoving = cachedProjectLead;
		cachedProjectLead = null;

		await forceClearThreads(client);
		await client.deleteAssistant(assistantRemoving.id);
	};

	const clearCachedProjectLead = async () => {
		if (!client || !cachedProjectLead) return;

		if (
			confirm(
				'Are you sure you want to remove the cached project lead assistant? This will also remove all threads and cannot be undone.'
			)
		) {
			await forceClearCachedProjectLead(client);
		}
	};

	const sendMessage = async () => {
		// Sends the message through a set of AI's that preprocess the message, breaking it down into smaller parts
		// TODO: Implement Preprocessing AI Pipeline
    // For now we just inject it into the project lead thread
    if (!client) return;

    if (!userInput.trim() || isLoading) return;

    isLoading = true;

    try {
      const threadId = $threadStore.keys().next().value;

      if (!threadId) {
        throw new Error('No thread found');
      }

      const thread = $threadStore.get(threadId);

      if (!thread) {
        throw new Error(`Thread not found: ${threadId}`);
      }

      const messageId = await client.addMessage(threadId, 'user', userInput);

      threadStore.update((store) => {
        if (!thread) {
          throw new Error(`Thread not found: ${threadId}`);
        }

        thread.messages.push({
          id: messageId,
          content: userInput,
          sender: 'user',
          timestamp: new Date().toISOString()
        });

        return store;
      });

      await client.streamRun(threadId, thread.assistantId);

      userInput = '';
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      isLoading = false;
    }
	};
</script>

{#if $threadStore.size > 0 && client}
	<div {...attrs}>
		<Container
			class={[
				'flex',
				'flex-row',
				'flex-wrap',
				'mb-4',
				'border',
				'border-slate-700',
				'bg-slate-800',
				'rounded-lg'
			].join(' ')}
		>
			<div class="flex flex-1 items-center gap-2 p-4">
				<Label for="apiLimit">Your Prompt:</Label>
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
							// Test string for quick testing (based on https://arxiv.org/pdf/2307.05300)
							userInput =
								'Write a short, one-paragraph background story of an NPC for the next Legend of Zelda game. The background story should mention (1) the incantation of the Patronus Charm in Harry Potter (2) the name of a character who is beheaded in the ninth episode of the Game of Thrones TV series, and (3) the name of the last song in the second album by Boards of Canada.';
							// Should fit in Zelda, e.g: Land of Hyrule, Link, Zelda, Ganon, Triforce, Master Sword, etc.
							// Should mention the incantation of the Patronus Charm in Harry Potter: Expecto Patronum
							// Should mention the Game of Thrones character who is beheaded in the ninth episode: Eddard "Ned" Stark, known as The Quiet Wolf
							// Should mention the name of the last song in the second album by Boards of Canada. The second album is Geogaddi, and the last song is "Magic Window"
						}
					}}
				/>
				<Button
					primary
					class="self-stretch"
					disabled={isLoading || !userInput.trim()}
					onclick={sendMessage}>Send</Button
				>
			</div>
			<div class="bg-slate-700 px-4 py-2">
				<span class={['text-slate-500', 'text-xs'].join(' ')}>Preprocessing Results:</span>
        <div class="flex flex-row flex-wrap items-center gap-2">
          {#each preprocessingResults as result, index}
            <InfoBulb title={result.preprocessor} color={result.color}>
              {result.result}
            </InfoBulb>
            {#if index < preprocessingResults.length - 1}
              <div class="text-slate-400">&raquo;</div>
            {/if}
          {/each}
        </div>
			</div>
		</Container>
		<Container class={['flex', 'flex-row', 'flex-wrap', 'gap-4'].join(' ')}>
			{#each $threadStore as [threadId, thread], index (threadId)}
				<ReasoningContainer {thread} {client} />
			{/each}
		</Container>
	</div>
{:else}
	<Container {...attrs}>
		<EmptyState>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
				/>
			</svg>

			<div slot="text">No collaboration started</div>

			<div slot="actions" class="flex w-full max-w-[500px] flex-col gap-4">
				<Checkbox
					bind:checked={enableCustomInstructions}
					label="Enable Custom Project Lead System Prompt"
				/>
				{#if enableCustomInstructions}
					<div class="flex w-full flex-col gap-2">
						<p>
							By customizing the System Prompt for the Project Lead Assistant, you can provide
							specific instructions for the assistant to follow.
						</p>
						<TextAreaEntry label="Custom Instructions" bind:value={customInstructions} rows={10} />
					</div>
				{/if}

				<Button onclick={start} primary>Start</Button>
			</div>
		</EmptyState>
	</Container>
{/if}

<div class="flex flex-row items-center gap-4 rounded-lg bg-slate-800 p-4">
	<Label>Actions</Label>
	{#if client}
		{#if $threadStore.size > 0}
			<Button onclick={clearThreads}>Remove All Threads</Button>
		{/if}
		{#if cachedProjectLead}
			<Button onclick={clearCachedProjectLead}>Clear Cached Project Leader Assistant</Button>
		{/if}
	{/if}
</div>
