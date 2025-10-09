<script lang="ts">
  import { CreateModelHeader } from "$components";
  import { type FormField, _t, extractFormToJson } from "$lib";
  import { createEventDispatcher } from "svelte";
  import DynamicForm2 from "./DynamicForm2.svelte";
  // export let name: string;
  // export let model: any;
  // export let schema: FormField[] = [];
  // export let cols: number = 1;
  // export let sideLabels: boolean = false;
  // export let headings: { title: string; href?: string }[] = [];
  // export let tabbed = false;
  // export let edit: boolean = false;
  let {
    name,
    model = $bindable(),
    schema = [],
    cols = 1,
    sideLabels = false,
    headings = [],
    tabbed = false,
    edit = $bindable(false),
  } = $props<{
    name: string;
    model: any;
    schema: FormField[];
    cols?: number;
    sideLabels?: boolean;
    headings?: { title: string; href?: string }[];
    tabbed?: boolean;
    edit?: boolean;
  }>();
  let formData: any = { ...model };
  const dispatch = createEventDispatcher<{
    submit: { form: FormData; data: any; name: string };
  }>();
  //   const headings = [{ title: $_t("Users") }];
  const onSubmit = (form: FormData) => {
    const data = extractFormToJson(form);
    dispatch("submit", { form, data, name });
    edit = false;
  };

  const onEdit = () => {
    edit = !edit;
  };
</script>

{#if !tabbed}
  <CreateModelHeader
    verb={edit ? "Cancel" : "Edit"}
    onCreate={onEdit}
    buttonColor={edit ? "alternative" : "primary"}
    {headings}
  />
{/if}

<DynamicForm2
  onsubmit={onSubmit}
  {edit}
  fields={schema}
  {cols}
  noClear
  {sideLabels}
  model={formData}
/>
