import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedApiKey = browser ?  localStorage.getItem('apiKey') : null;

export const apiKey = writable<string | null>(storedApiKey);

apiKey.subscribe(value => {
  if (!browser)
    return;

  if (value === null) {
    localStorage.removeItem('apiKey');
    return;
  }

  localStorage.setItem('apiKey', value);
});
