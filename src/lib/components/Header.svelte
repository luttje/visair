<script lang="ts">
	import type { User } from '$lib/User';
  import { apiKey } from '$lib/assistants/ApiKeyStore';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import Entry from './Entry.svelte';
	import Heading from './Heading.svelte';

  type Props = {
    user?: User;
  }

	let { user }: Props = $props();

  let chooseApiKey = $state('');
	let showApiKey = $state(false);

  const onLogin = () => {
    if (!chooseApiKey) {
      return;
    }

    user = {
      apiKey: chooseApiKey
    };

    apiKey.set(chooseApiKey);
  };

  const onLogout = () => {
    user = undefined;
    apiKey.set(null);
  };

  onMount(() => {
    if ($apiKey) {
      user = {
        apiKey: $apiKey
      };
    }
  });
</script>

<header>
	<div class="flex items-center justify-between p-8">
		<div class="flex flex-row items-center gap-2">
      <img src="/favicon.png" alt="VisAIR" class="size-16" />
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
        <Entry placeholder="OpenAI API key" bind:value={chooseApiKey} />
				<Button onclick={onLogin}>Log in</Button>
      </div>
			{/if}
		</div>
	</div>
</header>
