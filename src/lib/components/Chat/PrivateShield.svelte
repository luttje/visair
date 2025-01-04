<script lang="ts">
	import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();
</script>

<div class="p-4 rounded-md border-2 border-slate-500 relative" title="Private message">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class={['w-8', 'h-8', 'text-slate-500','rounded-md', 'absolute', 'left-1/2', '-translate-x-1/2', '-top-4', 'bg-slate-900', 'p-2'].join(' ')}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>

  {@render children?.()}
</div>