<script lang="ts">
  import {
    type PageDesignerModel,
    UserRoles,
    _t,
    appFileBase,
    siteUser,
  } from "$lib";
  import { Button, Heading, Img, P, Video } from "flowbite-svelte";
  import { EditOutline } from "flowbite-svelte-icons";
  import PageDesignerModal from "./PageDesignerModal.svelte";
  import StyleWriterCanvas from "./StyleWriterCanvas.svelte";
  let { page, pageKey } = $props<{
    page?: PageDesignerModel;
    pageKey?: string;
  }>();
  let localPage = $state<PageDesignerModel | undefined>(page);
  let editor = $state(false);
</script>

{#if pageKey}
  <PageDesignerModal bind:open={editor} bind:page={localPage} {pageKey} />
  <div class="flex flex-col gap-4 w-full">
    {#if $siteUser && $siteUser.role === UserRoles.ADMIN}
      <div class="ml-auto">
        <Button color="alternative" size="xs" onclick={() => (editor = true)}
          ><EditOutline></EditOutline></Button
        >
      </div>
    {/if}

    {#if localPage}
      {#each localPage.content as row}
        <div class="flex gap-8 items-start flex-wrap md:flex-nowrap w-full">
          {#each row.cols as col}
            <div class="w-full">
              {#if col.content.heading}
                <Heading tag="h3" class="mb-2">
                  {col.content.heading}
                </Heading>
              {/if}
              {#if col.type === "text"}
                <P>{col.content}</P>
              {:else if col.type === "image"}
                <Img
                  src={appFileBase(col.content.value)}
                  alt={col.content.alt}
                  width={col.content.meta?.width}
                  class={`${col.content.meta?.classNames} ${col.content.meta?.rounded ? "rounded-xl" : ""}`}
                  height={col.content.meta?.height}
                />
              {:else if col.type === "video"}
                <Video
                  src={col.content.value}
                  width={col.content.meta?.width}
                  height={col.content.meta?.height}
                />
              {:else if col.type === "html"}
                <StyleWriterCanvas content={col.content.value} />
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
{/if}
