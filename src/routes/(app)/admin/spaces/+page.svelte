<script lang="ts">
  import { Button } from "flowbite-svelte";
  import { _t, type SpacesModel } from "$lib";
  import { PlusOutline } from "flowbite-svelte-icons";
  import {
    Navbar,
    SpaceBuilder,
    PopoutInfo,
    SpaceEditorModal,
    SpacesListedView,
  } from "$components";
  import { onDestroy } from "svelte";
  import { BasicModelPage } from "$layouts";
  import { page } from "$app/state";

  let openDrawer = $state(true);
  let openEditor = $state(true);
  let apiModel = $state<SpacesModel | undefined>(undefined);

  const openKeyDrawer = async () => {
    openDrawer = !openDrawer;
  };

  onDestroy(() => {
    openDrawer = true;
  });
  let spaces = $state<SpacesModel[]>(page.data.spaces || []);

  const onSubmit = async (space: SpacesModel) => {
    spaces.push(space);
  };

  const setEdit = (space: SpacesModel) => {
    apiModel = space;
    openEditor = true;
  };

  const onEdit = (space: SpacesModel) => {
    const savedSpaces = [...spaces];
    for (let i = 0; i < savedSpaces.length; i++) {
      if (savedSpaces[i].uid !== space.uid) {
        continue;
      }
      savedSpaces[i] = space;
      break;
    }
    spaces = savedSpaces;
  };
</script>

{#if apiModel && openEditor}
  <SpaceEditorModal {onEdit} bind:open={openEditor} bind:model={apiModel} />
{/if}
{#snippet header()}
  <div slot="header" class="w-full flex items-center mx-5">
    <h5
      id="drawer-label"
      class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400 w-full"
    >
      <PopoutInfo
        message="A space allows you to create a collaborative environment for your projects."
      />

      {$_t("Public Spaces")}
    </h5>
  </div>
{/snippet}

{#snippet body()}
  <div
    class="flex w-full p-6 flex-grow max-h-[calc(100vh-8rem)] overflow-y-auto"
  >
    <div class="grow max-w-7xl mx-auto">
      <SpaceBuilder {onSubmit} />
    </div>
  </div>
{/snippet}

{#snippet createSection()}
  <Button onclick={openKeyDrawer} size="sm" class="hidden md:inline-flex"
    >{$_t("Create a new Space")} <PlusOutline /></Button
  >
{/snippet}

{#snippet createButton(space: SpacesModel)}
  <Button onclick={() => setEdit(space)}>
    {$_t("Edit Space")}
  </Button>
{/snippet}

{#snippet bodyContent()}
  <div class="flex w-full"></div>
  {#if spaces.length}
    <SpacesListedView {createButton} {spaces} />
  {:else}
    <div class="flex items-center justify-center h-[calc(100vh - 8rem)]">
      {$_t("You have not created any spaces yet")}
    </div>
  {/if}
{/snippet}

{#snippet headerContent()}
  <Navbar title="System Spaces" {createSection}></Navbar>
{/snippet}

<BasicModelPage {header} {body} {headerContent} {bodyContent} bind:openDrawer />
