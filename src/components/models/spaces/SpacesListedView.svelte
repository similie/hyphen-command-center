<script lang="ts">
  import { SpacesApi, type SpacesModel } from "$lib";
  import type { Snippet } from "svelte";
  import SpaceCard from "./SpaceCard.svelte";
  import { page } from "$app/state";
  import { PaginationControls } from "$components/input";
  let {
    spaces,
    createButton,
    cols = 4,
    class: className,
    wrapperClass,
  } = $props<{
    spaces: SpacesModel[];
    createButton: Snippet<[SpacesModel]>;
    cols?: number;
    class?: string;
    wrapperClass?: string;
  }>();
  const api = new SpacesApi();
  const limit = page.data.limit || 30;
  let currentPage = $state(0);
  let count = $state(page.data.count || 0);
  let search = $state("");
  let localSpaces = $state(spaces || []);

  const onChange = async (page: number) => {
    try {
      const response = await api.all(undefined, search, page, limit);
      count = response.count;
      localSpaces = response.spaces;
    } catch (error) {
      console.error("Error fetching spaces:", error);
    }
  };

  let colsClass = $state(
    `xl:grid-cols-${cols} lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1`,
  );
</script>

<div class="flex w-full mb-4 {className}">
  <div class="grid {colsClass} gap-4 ml-auto mr-auto {wrapperClass}">
    {#each localSpaces as space}
      <SpaceCard {createButton} model={space} />
    {/each}
  </div>
</div>

{#if count > limit}
  <PaginationControls bind:currentPage {limit} {count} {onChange} />
{/if}
