<script lang="ts">
  import TextAreaEntry from './TextAreaEntry.svelte';
  import Button from './Button.svelte';
	import type { AssistantThread } from '$lib/assistants/AssistantThread';
	import type { AssistantClient } from '$lib/assistants/AssistantClient';
	import GroupTitle from './Chat/GroupTitle.svelte';
	import ChatMessage from './Chat/ChatMessage.svelte';

  type Props = {
    thread: AssistantThread;
    client: AssistantClient;
  };

  let {
    thread,
    client,
    ...attrs
  }: Props = $props();

  let userInput = $state('');
  let isLoading = $state(false);

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    isLoading = true;
    try {
      await client.sendMessage(thread.id, userInput);
      userInput = '';
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error appropriately
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="flex flex-col h-full border border-slate-700 rounded-lg overflow-hidden bg-slate-800 w-96 h-[500px]" {...attrs}>
  <GroupTitle
    title={thread.config.name}
    description={thread.config.description}
  />

  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    {#each thread.messages as message (message.timestamp)}
      <ChatMessage
        content={message.content}
        sender={message.sender}
        timestamp={message.timestamp}
        isOwn={message.sender.name === 'You'}
      />
    {/each}
  </div>

  <div class="p-4 border-t border-slate-700 bg-slate-900">
    <div class="flex gap-2">
      <TextAreaEntry
        bind:value={userInput}
        placeholder="Type your message..."
        rows={2}
      />
      <Button
        primary
        disabled={isLoading || !userInput.trim()}
        onclick={sendMessage}
      >
        Send
      </Button>
    </div>
  </div>
</div>