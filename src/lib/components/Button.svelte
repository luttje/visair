<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		primary?: boolean;
		children?: Snippet;
		class?: string;
		disabled?: boolean;
	};

	const {
		children,
		primary = false,
		class: className,
		disabled = $bindable(false),
		...attrs
	}: Props = $props();
</script>

<button
	type="button"
	class={[
		'rounded-md',
		'px-4',
		'py-2',
		'text-white',
		'font-semibold',
		'text-center',
		disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer transition-transform hover:scale-105',
		className
	].join(' ')}
	class:bg-emerald-600={primary}
	class:bg-slate-700={!primary}
	{...attrs}
>
	{@render children?.()}
</button>
