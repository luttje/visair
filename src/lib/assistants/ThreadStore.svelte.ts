import { writable, derived, get } from 'svelte/store';
import type { AssistantThread } from './AssistantThread';
import { browser } from '$app/environment';
import type { Member } from '$lib/Member';

export type ThreadStore = Map<string, AssistantThread>;

// Restore recent threads from local storage, or create an empty Map
const restoredRecentThreads = new Map<string, AssistantThread>();

if (browser) {
  const storedRecentThreads = localStorage.getItem('recentThreads');

  if (storedRecentThreads) {
    const parsedRecentThreads = JSON.parse(storedRecentThreads);

    for (const [assistantId, thread] of Object.entries(parsedRecentThreads)) {
      restoredRecentThreads.set(assistantId, thread as AssistantThread);
    }
  }
}

export const threadStore = writable<ThreadStore>(restoredRecentThreads);

threadStore.subscribe(value => {
  if (!browser)
    return;

  const valueAsObject: Record<string, AssistantThread> = {};

  for (const [assistantId, thread] of value) {
    valueAsObject[assistantId] = thread;
  }

  localStorage.setItem('recentThreads', JSON.stringify(valueAsObject));
});

export const addThreadToStore = (thread: AssistantThread) => {
  threadStore.update(store => {
    store.set(thread.id, thread);
    return store;
  });
};

export const getSender = (senderId: 'user' | string): Member => {
  if (senderId === 'user') {
    return {
      id: 'user',
      name: 'User (you)',
      avatar: 'https://i.pravatar.cc/300',
      status: 'online',
      isTyping: false,
    };
  }

  // Find the assistant by checking all threads
  const store = get(threadStore);

  for (const thread of store.values()) {
    if (thread.assistantId === senderId) {
      return thread.config;
    }
  }

  throw new Error(`Assistant with id ${senderId} not found`);
}