<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = HTMLButtonAttributes & {
		primary?: boolean;
    children?: Snippet;
	};

	const { children, primary = false, ...attrs }: Props = $props();
  const isDisabled = $derived(attrs.disabled);
</script>

<button
	type="button"
	class={[
    'rounded-md', 'px-4', 'py-2', 'text-white', 'font-semibold', 'text-center',
    (isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'),
  ].join(' ')}
	class:bg-emerald-600={primary}
	class:bg-slate-700={!primary}
	{...attrs}
>
  {@render children?.()}
</button>
