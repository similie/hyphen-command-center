<script lang="ts">
  import type { ApplicationModel, ApplicationSubmissionModel } from "$lib";
  import { AccordionItem, Heading, P } from "flowbite-svelte";
  import { ApplicationFormManager } from ".";

  let { application, onRemove } = $props<{
    application: ApplicationModel;
    onRemove: (app: ApplicationModel) => void;
  }>();

  const onsubmit = (
    _app: ApplicationModel,
    details: ApplicationSubmissionModel,
  ) => {
    console.log("Form submitted:", application, details);
  };
</script>

<AccordionItem>
  {#snippet header()}
    <Heading tag="h4">{application.name}</Heading>
  {/snippet}
  <ApplicationFormManager {application} {onsubmit} editor />
</AccordionItem>
