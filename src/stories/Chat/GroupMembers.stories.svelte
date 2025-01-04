<script module lang="ts">
	import GroupMembers from '$lib/components/Chat/GroupMembers.svelte';
	import type { Member } from '$lib/Member';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  const { Story } = defineMeta({
    title: 'Components/GroupMembers',
    component: GroupMembers,
    tags: ['autodocs'],
    argTypes: {
      members: {
        control: 'object',
        description: 'Array of member objects containing id, name, avatar, status, and isTyping properties',
      },
      label: {
        control: 'text',
        description: 'Optional header label for the members list',
      }
    },
  });

  const defaultMembers: Member[] = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      status: 'online',
      isTyping: false
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      status: 'offline',
      isTyping: false
    },
    {
      id: '3',
      name: 'Bob Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      status: 'away',
      isTyping: true
    }
  ];
</script>

<!-- Default view with all members -->
<Story
  name="Default"
  args={{
    members: defaultMembers,
    label: 'Team Members'
  }}
/>

<!-- Without label -->
<Story
  name="No Label"
  args={{
    members: defaultMembers
  }}
/>

<!-- Empty state -->
<Story
  name="Empty"
  args={{
    members: [],
    label: 'Members'
  }}
/>

<!-- Single member typing -->
<Story
  name="Member Typing"
  args={{
    members: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        status: 'online',
        isTyping: true
      }
    ],
    label: 'Active Chat'
  }}
/>

<!-- All different statuses -->
<Story
  name="Status States"
  args={{
    members: [
      {
        id: '1',
        name: 'Online User',
        status: 'online',
        isTyping: false
      },
      {
        id: '2',
        name: 'Offline User',
        status: 'offline',
        isTyping: false
      },
      {
        id: '3',
        name: 'Away User',
        status: 'away',
        isTyping: false
      }
    ],
    label: 'Status Examples'
  }}
/>

<!-- Without avatars -->
<Story
  name="No Avatars"
  args={{
    members: [
      {
        id: '1',
        name: 'John Doe',
        status: 'online',
        isTyping: false
      },
      {
        id: '2',
        name: 'Jane Smith',
        status: 'offline',
        isTyping: false
      }
    ],
    label: 'Members'
  }}
/>