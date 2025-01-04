<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

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
  let required = 'required' in attrs;
</script>

<div class="relative flex-1">
	{#if label}
		<label
			for="input"
			class={['block', 'text-sm', 'font-medium', 'mb-1', error && 'text-red-500'].join(' ')}
		>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<input
    {...attrs}
		bind:value={value}
		id="input"
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
