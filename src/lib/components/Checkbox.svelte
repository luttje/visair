<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Label from './Label.svelte';
	import { getUniqueElementId } from '$lib/Utilities';

	type Props = {
		checked?: boolean;
		label?: string;
		error?: boolean;
		errorMessage?: string;
	} & HTMLInputAttributes;

	let {
		checked = $bindable(false),
		label = '',
		error = false,
		errorMessage = '',
		...attrs
	}: Props = $props();

	const isRequired = $derived(attrs.required);
	const isDisabled = $derived(attrs.disabled);

  const id = $derived(attrs.id);
  const uniqueId = getUniqueElementId();
</script>

<div class="flex-1 flex flex-row items-center gap-2">
	<input
		{...attrs}
		type="checkbox"
		bind:checked
		id={id || uniqueId}
		class={[
			'rounded-md',
      'border-2',
      'border-transparent',
			'focus:ring-offset-2',
			'focus:ring-2',
			'focus:outline-none',
      'bg-slate-500',
      'checked:bg-emerald-600',
			'appearance-none',
			'transition-colors',
			'duration-200',
			'cursor-pointer',
      'p-2',
			error
				? ['ring-red-500', 'focus:ring-red-500', 'focus:ring-red-500'].join(' ')
				: ['ring-gray-300', 'focus:ring-emerald-500', 'focus:ring-white'].join(' ')
		].join(' ')}
	/>

	{#if label}
		<Label
			for={id || uniqueId}
			class={[
				'block',
				error ? 'text-red-500' : 'text-white',
				isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'
			].join(' ')}
		>
			{label}
			{#if isRequired}
				<span class="text-red-500">*</span>
			{/if}
		</Label>
	{/if}
</div>
