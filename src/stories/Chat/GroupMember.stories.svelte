<script module>
	import GroupMember from '$lib/components/Chat/GroupMember.svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  const { Story } = defineMeta({
    title: 'Components/GroupMember',
    component: GroupMember,
    tags: ['autodocs'],
    argTypes: {
      name: {
        control: 'text',
        description: 'User display name',
      },
      avatar: {
        control: 'text',
        description: 'URL of the user avatar image',
      },
      status: {
        control: 'select',
        options: ['online', 'offline', 'away'],
        description: 'Current user status',
      },
      isTyping: {
        control: 'boolean',
        description: 'Indicates if the user is currently typing',
      },
    },
  });
</script>

<!-- Default avatar with initials -->
<Story
  name="Default"
  args={{
    name: 'John Doe',
  }}
/>

<!-- Avatar with image -->
<Story
  name="With Avatar"
  args={{
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/300',
    status: 'online',
  }}
/>

<!-- Online status -->
<Story
  name="Online Status"
  args={{
    name: 'Alice Johnson',
    status: 'online',
  }}
/>

<!-- Away status -->
<Story
  name="Away Status"
  args={{
    name: 'Bob Wilson',
    status: 'away',
  }}
/>

<!-- Typing state -->
<Story
  name="Typing"
  args={{
    name: 'Emma Davis',
    status: 'online',
    isTyping: true,
  }}
/>

<!-- All features combined -->
<Story
  name="Full Featured"
  args={{
    name: 'Sarah Parker',
    avatar: 'https://i.pravatar.cc/300',
    status: 'online',
    isTyping: true,
  }}
/>