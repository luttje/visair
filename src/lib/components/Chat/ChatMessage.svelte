<script lang="ts">
	import type { Member } from '$lib/Member';
	import { marked } from 'marked';
  import Conditional from '../Conditional.svelte';
  import PrivateShield from './PrivateShield.svelte';

  type Props = {
    content: string;
    sender: Member;
    timestamp: string;
    isOwn?: boolean;
    isPrivate?: boolean;
  };

  let {
    content,
    sender,
    timestamp,
    isOwn = false,
    isPrivate = false,
    ...attrs
  }: Props = $props();
</script>

<div class={`flex gap-3 max-w-2xl ${isOwn ? 'ml-auto flex-row-reverse' : ''}`} {...attrs}>
  <div class="w-8 h-8 rounded-full {sender.color} flex-shrink-0 flex items-center justify-center overflow-hidden">
    {#if sender.avatar}
      <div class="mb-1">
        {sender.avatar}
      </div>
    {:else}
      <span class="text-gray-600 text-sm">{sender.name[0].toUpperCase()}</span>
    {/if}
  </div>

  <Conditional when={isPrivate} element={PrivateShield}>
    <div class={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-medium">{sender.name}</span>
        <span class="text-xs text-gray-500">{new Date(timestamp).toLocaleTimeString()}</span>
      </div>

      <div class={[
        'px-4',
        'py-2',
        'rounded-lg',
        'max-w-lg',
        'text-gray-900',
        isOwn ? 'bg-emerald-300' : sender.color,
        'marked-container',
      ].join(' ')}>
        {@html marked(content)}
      </div>
    </div>
  </Conditional>
</div>
