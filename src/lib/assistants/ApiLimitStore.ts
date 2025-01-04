import { writable, derived, get } from 'svelte/store';

export interface ApiLimitState {
  count: number;
  limit: number | null;
}

function createApiLimitStore() {
  const { subscribe, set, update } = writable<ApiLimitState>({
    count: 0,
    limit: null
  });

  return {
    subscribe,
    increment: () => update(state => ({ ...state, count: state.count + 1 })),
    reset: () => update(state => ({ ...state, count: 0 })),
    setLimit: (limit: number | null) => update(state => ({ ...state, limit })),
    getLimit: () => get({ subscribe })?.limit,
    // Derived store for remaining calls
    remaining: derived({ subscribe }, state => 
      state.limit === null ? null : Math.max(0, state.limit - state.count)
    )
  };
}

export const apiLimits = createApiLimitStore();