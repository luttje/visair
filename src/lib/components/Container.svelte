<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, ...attrs }: Props = $props();
</script>

<div
	class={[
		'h-full',
		'border-2',
		'border-slate-700',
		'rounded-lg',
		'overflow-x-auto',
		'bg-slate-800',
		'p-4',
		attrs.class
	].join(' ')}
	{...attrs}
>
	{@render children?.()}
</div>
