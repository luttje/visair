<script lang="ts">
  type Props = {
    name: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away';
    isTyping?: boolean;
  };

  let {
    name,
    avatar = '',
    status = 'offline',
    isTyping = false,
    ...attrs
  }: Props = $props();

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };
</script>

<div class="flex items-center gap-3 p-2 hover:bg-slate-600 transition-colors duration-200" {...attrs}>
  <div class="relative">
    <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
      {#if avatar}
        <img src={avatar} alt={name} class="w-full h-full object-cover" />
      {:else}
        <span class="text-gray-600 text-lg">{name[0].toUpperCase()}</span>
      {/if}
    </div>
    <div class={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}>
    </div>
  </div>
  
  <div class="flex-1">
    <p class="font-medium text-sm">{name}</p>
    {#if isTyping}
      <p class="text-xs text-emerald-500">Typing...</p>
    {:else if status === 'online'}
      <p class="text-xs text-gray-500">Online</p>
    {/if}
  </div>
</div>