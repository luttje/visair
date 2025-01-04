import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize the store with the value from localStorage if available
const storedApiKey = browser ? localStorage.getItem('apiKey') : null;
const initialValue = storedApiKey || '';

const apiKeyStore = writable<string>(initialValue);

const createApiStore = () => {
  const { subscribe, set } = apiKeyStore;

  return {
    subscribe,

    // Set new API key and save to localStorage
    setApiKey: (apiKey: string) => {
      if (browser) {
        localStorage.setItem('apiKey', apiKey);
      }
      set(apiKey);
    },

    // Clear API key from both store and localStorage
    clearApiKey: () => {
      if (browser) {
        localStorage.removeItem('apiKey');
      }
      set('');
    },

    // Get current API key value
    getApiKey: (): string => {
      if (browser) {
        return localStorage.getItem('apiKey') || '';
      }

      return '';
    }
  };
};

export const apiStore = createApiStore();