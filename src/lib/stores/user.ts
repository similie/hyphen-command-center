import type { UserModel } from "$lib/types";
import { writable } from "svelte/store";
export const siteUser = writable<UserModel | undefined>(undefined);

export const siteUserInstance = () => {
  return new Promise<UserModel | undefined>((resolve) => {
    const un = siteUser.subscribe(resolve);
    un();
  });
};
