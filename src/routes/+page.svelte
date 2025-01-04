<script lang="ts">
	import { apiKey } from '$lib/assistants/ApiKeyStore';
	import { apiLimit, apiLimitCount } from '$lib/assistants/ApiLimitStore';
	import Container from '$lib/components/Container.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Entry from '$lib/components/Entry.svelte';
	import GroupReasoningContainer from '$lib/components/GroupReasoningContainer.svelte';

	let chooseApiLimit: number = $state(10);

	$effect(() => apiLimit.set(chooseApiLimit));
</script>

<main class="flex flex-col gap-4 p-8">
	{#if $apiKey}
    <div class="flex flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg">
      <Entry label="API Limit" type="number" bind:value={chooseApiLimit} />
      <span>
        Used: {$apiLimitCount}/{$apiLimit}
      </span>
    </div>

		<GroupReasoningContainer />
	{:else}
		<Container>
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
						d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
					/>
				</svg>

				<div slot="text">Enter your API key to get started.</div>
			</EmptyState>
		</Container>
	{/if}
</main>
