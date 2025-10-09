<script lang="ts">
  import { Button, NavLi } from "flowbite-svelte";
  import { Navbar } from "$components";
  import { type ModelTab, _t } from "$lib";
  import { createEventDispatcher, onMount } from "svelte";
  import ModelEditor from "./ModelEditor.svelte";
  // export let title: string = "";
  // export let tabs: ModelTab[] = [];
  let {
    title = "",
    tabs,
    cols = 1,
    sideLabels = true,
  } = $props<{
    title?: string;
    tabs: ModelTab[];
    cols?: number;
    sideLabels?: boolean;
  }>();
  let edit = $state(false);
  const dispatch = createEventDispatcher<{
    submit: { form: FormData; data: any; name: string };
  }>();
  //   export let model: any;
  //   export let schema: FormField[] = [];

  let siteName = $state("");
  const onEdit = () => {
    edit = !edit;
  };

  const onSubmit = (
    e: CustomEvent<{ form: FormData; data: any; name: string }>,
  ) => {
    e.preventDefault();
    // edit = false;
    dispatch("submit", e.detail);
  };

  let headings = $state(tabs.length ? tabs[0].headings : []);
  const changeTab = (tab: ModelTab) => {
    headings = tab.headings;
    edit = false;
    siteName = tab.name;
  };

  onMount(() => {
    if (!tabs.length) {
      return;
    }
    headings = tabs[0].headings;
    siteName = tabs[0].name;
  });

  //   export let headings: { title: string; href?: string }[] = [];
</script>

<div class="flex flex-col w-full">
  <Navbar {headings} {title}>
    {#snippet createSection()}
      <Button
        color={edit ? "alternative" : "primary"}
        outline={false}
        onclick={onEdit}>{$_t(edit ? "Cancel" : "Edit")}</Button
      >
    {/snippet}

    {#snippet navLi()}
      {#if tabs.length > 1}
        {#each tabs as tab}
          <NavLi
            href="#"
            onclick={(e) => {
              e.preventDefault();
              changeTab(tab);
            }}>{tab.heading}</NavLi
          >
        {/each}
      {/if}
    {/snippet}
  </Navbar>
  <div class="justify-center">
    {#each tabs as tab}
      {#if tab.active && siteName === tab.name}
        <ModelEditor
          on:submit={onSubmit}
          bind:model={tab.model}
          schema={tab.schema}
          {cols}
          tabbed={true}
          {sideLabels}
          name={tab.name}
          bind:edit
        />
      {/if}
    {/each}
  </div>
</div>
