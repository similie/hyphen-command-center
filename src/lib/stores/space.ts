import type { SpaceTags } from "$lib/types";
import { writable } from "svelte/store";

export const SpaceTagsStore = writable<SpaceTags[]>([]);
export const getAllTagFromStore = () => {
  return new Promise<SpaceTags[]>((resolve) => {
    const sendTags: SpaceTags[] = [];
    const unsubscribe = SpaceTagsStore.subscribe((tags) => {
      sendTags.push(...tags);
      resolve(sendTags);
    });

    unsubscribe();
  });
};
