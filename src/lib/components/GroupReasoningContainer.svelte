<script lang="ts">
	import type { AssistantThread } from '$lib/assistants/AssistantThread';
	import { AssistantClient } from '$lib/assistants/AssistantClient';
	import ReasoningContainer from './ReasoningContainer.svelte';
	import { apiKey } from '$lib/assistants/ApiKeyStore';
	import EmptyState from './EmptyState.svelte';

	import { threadStore, addThreadToStore, getSender } from '$lib/assistants/ThreadStore.svelte';

	import { projectLeadAssistant } from '$lib/assistants/configs/projectLeadAssistant';
	import Button from './Button.svelte';
	import Container from './Container.svelte';
	import { browser } from '$app/environment';
	import type { AssistantConfig } from '$lib/assistants/AssistantConfig';

	type Props = {};

	let { ...attrs }: Props = $props();

	const client = $apiKey ? new AssistantClient($apiKey) : null;

  const start = async () => {
    if (!client) 
      return;

    if (browser) {
      const cachedProjectLead = localStorage.getItem('projectLeadAssistant');
      
      if (cachedProjectLead) {
        const projectLeadAssistant = JSON.parse(cachedProjectLead);
        const threadId = await client.createThread();

        addThreadToStore({
          id: threadId,
          assistantId: projectLeadAssistant.id,
          config: projectLeadAssistant,
          messages: [
            {
              id: '',
              content: 'Hello, how can I help you today?',
              timestamp: new Date().toISOString(),
              sender: projectLeadAssistant.id,
            },
          ]
        });

        return;
      }
    }

    const assistantId = await client.createAssistant(projectLeadAssistant);
    const assistant: AssistantConfig = {
        ...projectLeadAssistant,
        id: assistantId,
      };

    if (browser) {
      localStorage.setItem('projectLeadAssistant', JSON.stringify(assistant));
    }

    const threadId = await client.createThread();

    addThreadToStore({
      id: threadId,
      assistantId,
      config: assistant,
      messages: [
        {
          id: '',
          content: 'Hello, how can I help you today?',
          timestamp: new Date().toISOString(),
          sender: assistantId,
        },
      ]
    });
  };

  const clearThreads = async () => {
    if (!client) 
      return;

    if (confirm('Are you sure you want to remove all threads? This cannot be undone.')) {
      const threads = $threadStore;

      for (const [threadId, thread] of threads) {
        await client.deleteThread(threadId);
      }

      threadStore.set(new Map());
    }
  };
</script>

{#if $threadStore.size > 0 && client}
	<Container
		class={[
			'flex',
			'flex-row',
			'flex-wrap',
			'gap-4',
		].join(' ')}
		{...attrs}
	>
		{#each $threadStore as [threadId, thread] (threadId)}
			<ReasoningContainer {thread} {client} />
		{/each}
	</Container>
    
  <div class="flex flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg">
    <Button onclick={clearThreads}>Remove All Threads</Button>
  </div>
{:else}
	<Container
		{...attrs}
	>
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

      <div slot="actions">
        <Button onclick={start} primary>Start</Button>
      </div>
		</EmptyState>
	</Container>
{/if}
