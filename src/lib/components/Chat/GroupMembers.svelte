<script lang="ts">
	import type { Member } from '$lib/Member';
  import GroupMember from './GroupMember.svelte';
  
  type Props = {
    members: Member[];
    label?: string;
  };

  let { members = [], label = 'Members' }: Props = $props();
</script>

<div class="w-full rounded-md border border-slate-950 overflow-hidden">
  {#if label}
    <div class="px-4 py-2 bg-slate-900 border-b border-slate-950">
      <h3 class="text-sm font-medium">{label} ({members.length})</h3>
    </div>
  {/if}
  
  <div class="divide-y divide-slate-950 bg-slate-800">
    {#each members as member (member.id)}
      <GroupMember
        name={member.name}
        avatar={member.avatar}
        status={member.status}
        isTyping={member.isTyping}
      />
    {/each}
  </div>
</div>