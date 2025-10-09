import { type TagsProps } from "flowbite-svelte";

export type TagKeys = {
  uid?: string;
  tag: string;
};

export interface TagsProperties extends Omit<TagsProps, "availableTags"> {
  availableTags: TagKeys[];
  onTagAdd?: (tag: TagKeys) => void;
  onTagRemove?: (tag: TagKeys) => void;
  onTagNotAvailable?: (tag: string) => Promise<TagKeys>;
}
