<script lang="ts">
  import { TagInput } from "$components/input";
  import { type SpaceTags, type TagKeys, type UUID, SpaceTagsAPI } from "$lib";
  import { SpaceTagsStore, getAllTagFromStore } from "$lib/stores/space";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    editable = true,
    ontag,
    id,
    required = false,
    sm = false,
    class: className = "",
  } = $props<{
    value?: UUID[];
    editable?: boolean;
    ontag?: (val: UUID, remove: boolean) => void;
    id?: string;
    sm?: boolean;
    required?: boolean;
    class?: string;
  }>();
  const api = new SpaceTagsAPI();
  let tagValues = $state<string | undefined>(undefined);
  let hiddenEl = $state<HTMLInputElement | undefined>(undefined);
  //   let tagStore = $state<string[]>([]);
  let tagState = $state<Record<UUID, boolean>>({});
  let allTags = $state<SpaceTags[]>([]);
  let ready = $state<boolean>(false);

  const setTagValue = () => {
    if (!value) {
      return (tagValues = undefined);
    }
    tagValues = value.join(",");
    hiddenEl && hiddenEl.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenEl && hiddenEl.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const setTagState = () => {
    const setValues: Record<UUID, boolean> = {};
    value?.forEach((val: UUID) => {
      setValues[val] = true;
    });

    allTags.forEach((tag) => {
      tagState[tag.uid] = setValues[tag.uid] || false;
    });
    ready = true;
  };

  const getAllTags = async () => {
    try {
      allTags = await getAllTagFromStore();
      if (allTags.length) {
        return setTagState();
      }
      const { tags } = await api.all();
      allTags = tags;
      SpaceTagsStore.set(tags);
      setTagState();
    } catch (e) {
      console.log("Error fetching all tags:", e);
    }
  };

  const onTagAdd = (value: TagKeys) => {
    setTagValue();
    value.uid && ontag && ontag(value, false);
  };
  const onTagRemove = (value: TagKeys) => {
    setTagValue();
    value.uid && ontag && ontag(value.uid, true);
  };

  const onTagNotAvailable = async (tag: string) => {
    const created = await api.create({ tag });

    SpaceTagsStore.update((tags) => {
      tags.push(created);
      return tags;
    });
    allTags = [...allTags, created];
    return { tag: created.tag, uid: created.uid };
  };

  onMount(() => {
    !value && (value = []);
    setTagValue();
    getAllTags();
  });
</script>

{#if editable && value && ready}
  <TagInput
    unique
    bind:value
    allowNewTags
    availableTags={allTags.map((tag) => ({ tag: tag.tag, uid: tag.uid }))}
    placeholder="Tag your Space"
    showAvailableTags
    {onTagAdd}
    {onTagRemove}
    {onTagNotAvailable}
  />

  <input
    bind:this={hiddenEl}
    bind:value={tagValues}
    type="hidden"
    {id}
    {required}
  />
{:else if !editable}
  <div class="flex flex-wrap gap-2 {className}">
    {#each allTags as tag (tag.uid)}
      {#if value && value.includes(tag.uid)}
        <span
          class="inline-flex items-center gap-1 rounded-lg border border-primary-300 bg-primary-50 {sm
            ? 'px-1'
            : 'px-2 py-1'} text-sm text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >{tag.tag}</span
        >
      {/if}
    {/each}
  </div>
{/if}
