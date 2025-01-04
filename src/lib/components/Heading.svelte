<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
    children?: Snippet;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		class?: string;
	};

	const { children, level = 1, class: className = '',...attrs }: Props = $props();

	const baseStyles = ['font-bold'].join(' ');

	const levelStyles = {
		1: 'text-3xl md:text-4xl',
    2: 'text-2xl md:text-3xl',
		3: 'text-xl md:text-2xl',
		4: 'text-lg md:text-xl',
    5: 'text-base md:text-lg',
    6: 'text-sm md:text-base',
	};
</script>

<svelte:element {...attrs} this={`h${level}`} class={[baseStyles, levelStyles[level], className].join(' ')}>
  {@render children?.()}
</svelte:element>
