<script lang="ts">
  import { Tabs, TabItem } from "flowbite-svelte";
  import { CreateModelHeader } from "$components/models";
  import { type ModelTab, _t } from "$lib";
  import { createEventDispatcher } from "svelte";
  import ModelEditor from "./ModelEditor.svelte";
  export let tabs: ModelTab[] = [];
  let edit = false;
  const dispatch = createEventDispatcher<{
    submit: { form: FormData; data: any; name: string };
  }>();
  //   export let model: any;
  //   export let schema: FormField[] = [];
  export let cols: number = 1;
  export let sideLabels: boolean = true;

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

  let headings = tabs.length ? tabs[0].headings : [];
  const changeTab = (tab: ModelTab) => {
    headings = tab.headings;
    edit = false;
  };

  //   export let headings: { title: string; href?: string }[] = [];
</script>

<CreateModelHeader
  verb={edit ? "Cancel" : "Edit"}
  onCreate={onEdit}
  buttonColor={edit ? "alternative" : "primary"}
  {headings}
/>
<Tabs>
  {#each tabs as tab}
    <TabItem
      onclick={() => changeTab(tab)}
      title={tab.heading}
      open={tab.active}
    >
      <ModelEditor
        on:submit={onSubmit}
        model={tab.model}
        schema={tab.schema}
        {cols}
        tabbed={true}
        {sideLabels}
        name={tab.name}
        bind:edit
      />
    </TabItem>
  {/each}
</Tabs>
