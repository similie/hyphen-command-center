// src/lib/stores/persistent.ts

import { writable, type Writable } from "svelte/store";

export function persistent<T>(key: string, initialValue: T): Writable<T> {
  const isBrowser = typeof window !== "undefined";

  let startValue = initialValue;

  if (isBrowser) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        startValue = JSON.parse(stored);
      } catch (e) {
        console.warn(`Failed to parse localStorage value for ${key}`, e);
      }
    }
  }

  const store = writable<T>(startValue);

  if (isBrowser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}
