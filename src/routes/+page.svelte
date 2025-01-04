<script lang="ts">
	import type { User } from '$lib/User';
  import Header from '$lib/components/Header.svelte';
	import Heading from '$lib/components/Heading.svelte';

  let user: User|undefined = $state(undefined);
</script>

<article>
  <Header
    user={user}
  />

  <section class="p-8">
    <Heading level={2}>
      Page
    </Heading>
  </section>
</article>
