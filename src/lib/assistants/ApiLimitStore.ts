import { writable, derived, get } from 'svelte/store';

export const apiLimit = writable<number>(0);

export const apiLimitCount = writable<number>(0);

export function incrementApiLimitCount() {
  apiLimitCount.update(value => {
    return value + 1;
  });
}