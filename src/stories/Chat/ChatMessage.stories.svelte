<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChatMessage from '$lib/components/Chat/ChatMessage.svelte';
  import { fn } from '@storybook/test';
	import type { Member } from '$lib/Member';

  const personas: Member[] = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/300',
      status: 'online',
      isTyping: false,
      color: 'bg-teal-200'
    },
    {
      id: '2',
      name: 'Alice Smith',
      avatar: 'https://i.pravatar.cc/300',
      status: 'offline',
      isTyping: false,
      color: 'bg-rose-300'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      avatar: 'https://i.pravatar.cc/300',
      status: 'away',
      isTyping: true,
      color: 'bg-sky-300'
    },
    {
      id: '4',
      name: 'Charlie Brown',
      avatar: 'https://i.pravatar.cc/300',
      status: 'offline',
      isTyping: false,
      color: 'bg-amber-300'
    },
    {
      id: '5',
      name: 'Me',
      avatar: 'https://i.pravatar.cc/300',
      status: 'online',
      isTyping: false
    }
  ];

  const { Story } = defineMeta({
    title: 'Components/ChatMessage',
    component: ChatMessage,
    tags: ['autodocs'],
    argTypes: {
      content: {
        control: 'text',
        description: 'The message content'
      },
      sender: {
        control: 'select',
        description: 'Name of the message sender',
        options: personas
      },
      timestamp: {
        control: 'text',
        description: 'Message timestamp'
      },
      isOwn: {
        control: 'boolean',
        description: 'Whether the message is sent by the current user'
      },
      isPrivate: {
        control: 'boolean',
        description: 'Whether the message is private'
      },
    }
  });
</script>

<Story
  name="Received Message"
  args={{
    content: "Hi there! How are you doing today?",
    sender: personas[0],
    timestamp: "10:30 AM",
    isOwn: false,
    isPrivate: false
  }}
/>

<Story
  name="Own Message"
  args={{
    content: "I'm doing great, thanks for asking!",
    sender: personas[4],
    timestamp: "10:31 AM",
    isOwn: true,
    isPrivate: false
  }}
/>

<Story
  name="Shielded Message"
  args={{
    content: "This is a private message that only I can see.",
    sender: personas[2],
    timestamp: "10:35 AM",
    isOwn: false,
    isPrivate: true
  }}
/>

<Story
  name="With Avatar"
  args={{
    content: "Here's a message with an avatar!",
    sender: personas[1],
    timestamp: "10:40 AM",
    isOwn: false,
  }}
/>

<Story
  name="Long Message"
  args={{
    content: "This is a much longer message that demonstrates how the component handles text wrapping for larger content blocks. It should properly wrap within the maximum width constraints while maintaining readability.",
    sender: personas[2],
    timestamp: "10:45 AM",
    isOwn: false
  }}
/>

<!-- Own private message -->
<Story
  name="Own Private Message"
  args={{
    content: "This is my private message.",
    sender: personas[4],
    timestamp: "10:50 AM",
    isOwn: true,
    isPrivate: true
  }}
/>