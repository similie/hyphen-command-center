import { writable } from "svelte/store";

export const ScrollTopValue = writable<{ top: number; height: number }>({
  height: 0,
  top: 0,
});
