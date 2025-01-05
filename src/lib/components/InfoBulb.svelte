<script lang="ts">
	import type { DOMAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import Label from './Label.svelte';
	import { getUniqueElementId } from '$lib/Utilities';
	import Heading from './Heading.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		title: string;
		color?: string;
		class?: string;
	} & DOMAttributes<HTMLButtonElement> &
		HTMLTextareaAttributes;

	let {
		children,
		title,
		class: className = '',
		color = 'bg-stone-400',
		...attrs
	}: Props = $props();
</script>

<button
	onclick={() => {}}
	{...attrs}
	class={['group', 'rounded-lg', 'size-6', color, 'cursor-pointer', 'relative', className].join(
		' '
	)}
>
	<div
		class="absolute right-0 top-full hidden min-w-96 flex-col rounded-lg bg-slate-800 p-4 text-left shadow-lg group-hover:flex group-focus:flex"
	>
		<Heading level={3} class="text-emerald-400">
			{title}
		</Heading>
		{@render children()}
	</div>
</button>
