<script lang="ts">
  import type { FormModel } from "$lib";
  import { AccordionItem, Heading } from "flowbite-svelte";
  import { CreateFormElement } from ".";
  import { Toast } from "$components";

  let { form } = $props<{ form: FormModel }>();
  const onAction = (form: FormModel) => {
    Toast.success(`Form ${form.name} updated successfully!`);
  };
</script>

<AccordionItem>
  {#snippet header()}
    <Heading tag="h3">{form.name}</Heading>
  {/snippet}
  <CreateFormElement model={form} {onAction} />
</AccordionItem>
