import { writable, derived, get } from 'svelte/store';
import type { AssistantThread } from './AssistantThread';

interface ThreadStore {
  [threadId: string]: AssistantThread;
}

const createThreadStore = () => {
  const { subscribe, set, update } = writable<ThreadStore>({});

  return {
    subscribe,
    set,
    update,

    getThread: (threadId: string) => {
      const store = get({ subscribe });
      return store[threadId];
    },

    getAllThreads: () => {
      return Object.values(get({ subscribe }));
    },

    addThread: (thread: AssistantThread) => {
      update(store => ({
        ...store,
        [thread.id]: thread
      }));
    },

    updateThread: (threadId: string, updates: Partial<AssistantThread>) => {
      update(store => ({
        ...store,
        [threadId]: {
          ...store[threadId],
          ...updates
        }
      }));
    }
  };
};

export const threads = createThreadStore();
