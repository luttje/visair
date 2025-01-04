<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type Props = HTMLButtonAttributes & {
		primary?: boolean;
    children?: Snippet;
	};

	const { children, primary = false, ...args }: Props = $props();
</script>

<button
	type="button"
	class={['rounded-md', 'px-4', 'py-2', 'text-white', 'font-semibold', 'text-center'].join(' ')}
	class:bg-emerald-600={primary}
	class:bg-slate-700={!primary}
	{...args}
>
  {@render children?.()}
</button>
