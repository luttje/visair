<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import Label from "./Label.svelte";
	import { getUniqueElementId } from "$lib/Utilities";

	type Props = {
		value?: any;
		label?: string;
		error?: boolean;
		errorMessage?: string;
	} & HTMLInputAttributes

	let {
		value = $bindable(''),
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

<div class="relative flex-1">
	{#if label}
    <Label
			for={id || uniqueId}
			class={[
        'block', 'text-sm', 'font-medium', 'mb-1', error && 'text-red-500',
        (isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'),
      ].join(' ')}
		>
			{label}
			{#if isRequired}
				<span class="text-red-500">*</span>
			{/if}
      </Label>
	{/if}

	<input
    {...attrs}
		bind:value={value}
    id={id || uniqueId}
		class={[
			'w-full',
			'rounded-md',
			'px-4',
			'py-2',
			'border',
			'outline-none',
			'transition-colors',
			'duration-200',
			'text-black',
			error
				? ['border-red-500', 'focus:border-red-500', 'focus:ring-1', 'focus:ring-red-500'].join(' ')
				: [
						'border-gray-300',
						'focus:border-emerald-500',
						'focus:ring-1',
						'focus:ring-emerald-500'
					].join(' ')
		].join(' ')}
	/>

	{#if error && errorMessage}
		<p class="mt-1 text-sm text-red-500">
			{errorMessage}
		</p>
	{/if}
</div>
