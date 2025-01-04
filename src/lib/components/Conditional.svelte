<script lang="ts">
	import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
    when: boolean;
    element: any;
  };
  
  let {
    children,
    when,
    element,
    ...attrs
  }: Props = $props();
</script>

{#if when}
  <svelte:component this={element} {...attrs}>
    {@render children?.()}
  </svelte:component>
{:else}
  {@render children?.()}
{/if}