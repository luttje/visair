<!-- TextAreaEntry.svelte -->
<script lang="ts">
	import type { DOMAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import Label from './Label.svelte';
	import { getUniqueElementId } from '$lib/Utilities';

	type Props = {
		value?: any;
		label?: string;
		error?: boolean;
		errorMessage?: string;
		class?: string;
		rows?: number;
	} & DOMAttributes<HTMLTextAreaElement> &
		HTMLTextareaAttributes;

	let {
		value = $bindable(),
		label = '',
		error = false,
		errorMessage = '',
		class: className = '',
		rows = 3,
		...attrs
	}: Props = $props();

	let required = 'required' in attrs;
  
  const id = $derived(attrs.id);
  const uniqueId = getUniqueElementId();
</script>

<div class={['relative', 'flex-1'].join(' ')}>
	{#if label}
		<Label
			for={id || uniqueId}
		>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</Label>
	{/if}
	<textarea
		{...attrs}
		{rows}
		bind:value
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
			'resize-y',
			className,
			error
				? ['border-red-500', 'focus:border-red-500', 'focus:ring-1', 'focus:ring-red-500'].join(' ')
				: [
						'border-gray-300',
						'focus:border-emerald-500',
						'focus:ring-1',
						'focus:ring-emerald-500'
					].join(' ')
		].join(' ')}
	>
	</textarea>
	{#if error && errorMessage}
		<p class="mt-1 text-sm text-red-500">
			{errorMessage}
		</p>
	{/if}
</div>
