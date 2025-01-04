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

<div class="border-b border-gray-200 px-4 py-3 text-gray-500" {...attrs}>
  <div class="flex items-center justify-between">
    <Heading level={2} class="">
      {title}
    </Heading>
    {#if memberCount !== undefined}
      <span class="text-sm">{memberCount} members</span>
    {/if}
  </div>
  
  {#if description}
    <p class="mt-1 text-sm">{description}</p>
  {/if}
</div>