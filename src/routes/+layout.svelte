<script lang="ts">
	import '../app.css';
	import type { User } from '$lib/User';
  import Header from '$lib/components/Header.svelte';
  
  let user: User|undefined = $state(undefined);
	let { children } = $props();
</script>

<Header
  user={user}
/>

{@render children()}
