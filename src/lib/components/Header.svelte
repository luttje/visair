<script lang="ts">
	import type { User } from '$lib/User';
	import Button from './Button.svelte';
	import Entry from './Entry.svelte';
	import Heading from './Heading.svelte';

  type Props = {
    user?: User;
  }

	let { user }: Props = $props();

	let showApiKey = $state(false);
  let apiKey = $state('');

  const onLogin = () => {
    user = {
      apiKey
    };

    console.log(user);
  };

  const onLogout = () => {
    user = undefined;
  };
</script>

<header>
	<div class="flex items-center justify-between p-8">
		<div>
			<Heading level={1}>VisAIR</Heading>
		</div>
		<div>
			{#if user}
				<span class="welcome">
					{#if showApiKey}
						<span class="text-xs">{user.apiKey}</span>
					{/if}
					<Button
						primary
						label={showApiKey ? 'Hide API key' : 'Show API key'}
						onClick={() => {
							showApiKey = !showApiKey;
						}}
					/>
				</span>
				<Button onClick={onLogout} label="Log out" />
			{:else}
      <div class="flex flex-row items-end gap-4">
        <Entry label="OpenAI API key"
          bind:value={apiKey} />
				<Button onClick={onLogin} label="Log in" />
      </div>
			{/if}
		</div>
	</div>
</header>
