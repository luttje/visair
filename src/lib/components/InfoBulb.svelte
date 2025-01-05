<script lang="ts">
	import type { DOMAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import Heading from './Heading.svelte';
	import type { Snippet } from 'svelte';

	type Props = DOMAttributes<HTMLButtonElement> &
		HTMLTextareaAttributes & {
			children: Snippet;
			title: string;
			colors?: any;
			class?: string;
			pulsing?: boolean;
		};

	let {
		children,
		title,
		class: className = '',
		colors = 'bg-stone-400',
		pulsing = false,
		...attrs
	}: Props = $props();

	let backgroundColor = $derived.by(() => {
		if (typeof colors === 'string') {
			return colors;
		}

		return colors.background;
	});

	let textColor = $derived.by(() => {
		if (typeof colors === 'string') {
			return '';
		}

		return colors.text;
	});
</script>

<button
	onclick={() => {}}
	{...attrs}
	class={[
		'group',
		'size-6',
		'relative',
		className,
	].join(' ')}
>
  <div class={[
    'absolute',
    'inset-0',
		'rounded-lg',
    backgroundColor,
    'cursor-pointer',
    pulsing ? 'animate-pulse' : '',
  ].join(' ')}>  </div>
	<div
		class="absolute right-0 top-full hidden w-[600px] flex-col rounded-lg bg-slate-800 p-4 text-left shadow-lg group-hover:flex group-focus:flex"
	>
		<Heading level={3} class={[textColor].join(' ')}>
			{title}
		</Heading>
		{@render children()}
	</div>
</button>
