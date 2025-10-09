import type { UserConfig } from "$lib/types";
import { writable } from "svelte/store";
export const userConfig = writable<UserConfig | undefined>(undefined);

export const userConfigInstance = () => {
  return new Promise<UserConfig | undefined>((resolve) => {
    userConfig.subscribe(resolve);
  });
};
