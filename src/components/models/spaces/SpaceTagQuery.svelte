<script lang="ts">
  import { _t, SpaceTagsAPI, type SpaceTags, type UUID } from "$lib";
  import { getAllTagFromStore, SpaceTagsStore } from "$lib/stores/space";
  import { A, Button, Checkbox, Dropdown } from "flowbite-svelte";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  let tagState = $state<Record<UUID, boolean>>({});
  const api = new SpaceTagsAPI();
  let { onChange, class: className } = $props<{
    onChange?: (tags: UUID[]) => void;
    class?: string;
  }>();
  const setTagState = () => {
    allTags.forEach((tag) => {
      tagState[tag.uid] = false;
    });
  };

  let allTags = $state<SpaceTags[]>([]);

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
  onMount(getAllTags);

  const sendChanges = () => {
    const selected = Object.keys(tagState).filter(
      (key) => tagState[key as UUID],
    );
    onChange && onChange(selected);
  };

  const setActive = (tag: SpaceTags) => {
    tagState[tag.uid] = !tagState[tag.uid];
    sendChanges();
  };
</script>

<div
  class="md:flex w-full flex-wrap border-t-gray-100 border-b-gray-100 dark:border-b-gray-800 dark:border-t-gray-800 justify-center space-y-2 hidden {className}"
>
  {#each allTags as tag, index}
    <A
      onclick={() => setActive(tag)}
      class="inline-flex items-center gap-1 w-fit p-4 cursor-pointer {tagState[
        tag.uid
      ]
        ? 'text-primary-600 dark:text-primary-500'
        : 'text-gray-500 dark:text-gray-100'} {index > 0 &&
      index < allTags.length
        ? 'border-l border-gray-100 dark:border-gray-800'
        : ''}"
    >
      {$_t(tag.tag)}
    </A>
  {/each}
</div>

<div class="sm:flex xs:flex md:hidden w-full mb-6">
  <Button color="alternative" class=" w-full"
    >{$_t("Filter Courses")}<ChevronDownOutline /></Button
  >
  <Dropdown simple class="p-2">
    {#each allTags as tag}
      <li>
        <Checkbox bind:checked={tagState[tag.uid]} onchange={sendChanges}
          >{$_t(tag.tag)}</Checkbox
        >
      </li>
    {/each}
  </Dropdown>
</div>
