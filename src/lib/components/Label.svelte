<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props = {
		children?: Snippet;
		class?: string;
	} & HTMLLabelAttributes;

	const { children, class: className = '', ...attrs }: Props = $props();
</script>

<label {...attrs} class={['text-slate-500', 'text-xs', className].join(' ')}>
	{@render children?.()}
</label>
