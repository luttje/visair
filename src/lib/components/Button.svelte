<script lang="ts">
	type Props = {
		primary?: boolean;
		label: string;
		onClick?: () => void;
	};

	const { primary = false, label, onClick }: Props = $props();
</script>

<button
	type="button"
	class={['rounded-md', 'px-4', 'py-2', 'text-white', 'font-semibold', 'text-center'].join(' ')}
	class:bg-emerald-600={primary}
	class:bg-slate-700={!primary}
	onclick={onClick}
>
	{label}
</button>
