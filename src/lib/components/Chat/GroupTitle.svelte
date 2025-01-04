<script lang="ts">
	import Heading from "../Heading.svelte";

  type Props = {
    title: string;
    description?: string;
    memberCount?: number;
  };

  let {
    title,
    description = '',
    memberCount,
    ...attrs
  }: Props = $props();
</script>

<div class="bg-slate-700 px-4 py-3" {...attrs}>
  <div class="flex items-center justify-between">
    <Heading level={2} class="">
      {title}
    </Heading>
    {#if memberCount !== undefined}
      <span class="text-sm text-gray-400">{memberCount} members</span>
    {/if}
  </div>
  
  {#if description}
    <p class="mt-1 text-sm text-gray-400">{description}</p>
  {/if}
</div>