<script lang="ts">
	import type { AssistantThread } from '$lib/assistants/AssistantThread';
	import { AssistantClient } from '$lib/assistants/AssistantClient';
	import ReasoningContainer from './ReasoningContainer.svelte';
	import { apiStore } from '$lib/ApiStore.svelte';
	import EmptyState from './EmptyState.svelte';
	import { threads as threadStore } from '$lib/assistants/ThreadStore.svelte';

	type Props = {
	};

	let { ...attrs }: Props = $props();
	//let threads = $derived(threadStore.getAllThreads());
  const testAssistant = {
    id: 'assistant',
    name: 'Assistant',
    description: 'Helps you with your tasks',
    color: 'bg-amber-300',
  };
  const threads: AssistantThread[] = [
    // So the idea is: The user enters their prompt with the assistant, and that assistant will then
    // determine (all of this will be visible to the user):
    // 1. Which personas to generate that would be most helpful for the users prompt
    // 2. The assistant will then generate the personas, which will cause them to display here
    // 3. The assistant will have formulated a task for each persona and give them that to think about it
    // 4. When they come back, the assistant will hand the personas responses to all other personas
    // 5. This loop will continue until all personas agree they have a good answer
    {
      id: 'thread1',
      assistantId: 'assistant1',
      config: testAssistant,
      messages: [
        {
          content: 'Hello, how can I help you today?',
          sender: testAssistant,
          timestamp: new Date(),
        },
      ]
    },
    // {
    //   id: 'thread2',
    //   assistantId: 'assistant1',
    //   config: {
    //     id: 'assistant1',
    //     name: 'Research Assistant',
    //     description: 'Helps with research tasks',
    //   },
    //   messages: []
    // },
    // {
    //   id: 'thread3',
    //   assistantId: 'assistant1',
    //   config: {
    //     id: 'assistant1',
    //     name: 'Research Assistant',
    //     description: 'Helps with research tasks',
    //   },
    //   messages: []
    // },
    // {
    //   id: 'thread4',
    //   assistantId: 'assistant1',
    //   config: {
    //     id: 'assistant1',
    //     name: 'Research Assistant',
    //     description: 'Helps with research tasks',
    //   },
    //   messages: []
    // },
  ];

	const client = new AssistantClient(apiStore.getApiKey());
</script>

<div
	class={[
		'flex',
    'flex-row',
    'flex-wrap',
		'gap-4',
		'h-full',
		'border-2',
		'border-slate-700',
		'rounded-lg',
		'overflow-x-auto',
		'bg-slate-800',
		'p-4'
	].join(' ')}
	{...attrs}
>
	{#each threads as thread (thread.id)}
		<ReasoningContainer {thread} {client} />
	{:else}
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

			<div slot="text">No threads available. Give a starting prompt!</div>
		</EmptyState>
	{/each}
</div>
