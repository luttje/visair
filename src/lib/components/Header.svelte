<script lang="ts">
	import type { User } from '$lib/User';
  import { apiStore } from '$lib/ApiStore.svelte';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import Entry from './Entry.svelte';
	import Heading from './Heading.svelte';

  type Props = {
    user?: User;
  }

	let { user }: Props = $props();
	let showApiKey = $state(false);
  let apiKey = $state(apiStore.getApiKey());

  const onLogin = () => {
    user = {
      apiKey
    };

    apiStore.setApiKey(apiKey);
  };

  const onLogout = () => {
    user = undefined;
    apiStore.clearApiKey();
  };

  onMount(() => {
    if (apiKey) {
      user = {
        apiKey
      };
    }
  });
</script>

<header>
	<div class="flex items-center justify-between p-8">
		<div>
			<Heading level={1}>VisAIR</Heading>
		</div>
    <div class="flex flex-row items-center gap-4">
			{#if user}
				<div class="flex flex-row items-center gap-4">
					{#if showApiKey}
            <Entry value={user.apiKey} />
					{/if}
					<Button
						primary
						onclick={() => {
							showApiKey = !showApiKey;
						}}
					>
            {showApiKey ? 'Hide API key' : 'Show API key'}
          </Button>
				</div>
				<Button onclick={onLogout}>Log out</Button>
			{:else}
      <div class="flex flex-row items-end gap-4">
        <Entry placeholder="OpenAI API key" bind:value={apiKey} />
				<Button onclick={onLogin}>Log in</Button>
      </div>
			{/if}
		</div>
	</div>
</header>
