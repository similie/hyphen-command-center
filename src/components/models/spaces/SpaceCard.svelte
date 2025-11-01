<script lang="ts">
  import { type SpacesModel, _t, appFileBase } from "$lib";
  import { Button, Hr, Badge, Img } from "flowbite-svelte";
  import type { Snippet } from "svelte";

  import SvelteMarkdown from "svelte-markdown";

  import { GradientBackground } from "$components";
  import {
    PeopleConnecting,
    PeopleConnectingDark,
  } from "flowbite-svelte-illustrations";
  import SpaceTagsInput from "./SpaceTagsInput.svelte";
  import { goto } from "$app/navigation";
  let { model = $bindable(), createButton } = $props<{
    model: Partial<SpacesModel>;
    createButton?: Snippet<[SpacesModel]>;
  }>();

  const handleButtonClick = () => {
    // Handle button click
    if (!model.uid) {
      return;
    }
    goto(`/spaces/${model.uid}`);
  };
</script>

<GradientBackground className="w-full h-full">
  <div
    class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md max-w-sm w-full h-full flex flex-col"
  >
    {#if model.image}
      <Img
        src={model.image ? appFileBase(model.image, { size: "lg" }) : undefined}
        class="object-fill w-full h-48 rounded-t-md"
      />
    {:else}
      <div class="flex items-center justify-center w-full overflow-clip h-48">
        <div class="dark:hidden">
          <PeopleConnecting />
        </div>
        <div class="hidden dark:block">
          <PeopleConnectingDark />
        </div>
      </div>
    {/if}
    <div class="flex flex-col h-full p-2 md:p-6">
      <!-- <div class="grid grid-row-auto "> -->
      <h5
        class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center"
      >
        {$_t(model.name || "Make it catchy")}
      </h5>
      <div class="w-full h-54 overflow-y-auto basis-full">
        <SvelteMarkdown source={model.teaser}></SvelteMarkdown>
      </div>
      <div class="w-full mt-auto">
        {#if model.tags}
          <SpaceTagsInput sm class="mt-2" editable={false} value={model.tags} />
        {/if}
      </div>
      <div class="w-full flex-col">
        <Hr class="my-4" />
        {#if model.uid && !model.active}
          <Badge color="rose">{$_t("Not Active")}</Badge>
        {/if}
        <div class="flex w-full justify-between items-center flex-wrap">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">
            {#if model.price}
              ${model.price}
            {:else}
              {$_t("Free")}
            {/if}
          </span>
          {#if createButton}
            {@render createButton(model)}
          {:else}
            <Button type="button" onclick={handleButtonClick}
              >{$_t(model.btnText || "Make It Mine")}</Button
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
</GradientBackground>
