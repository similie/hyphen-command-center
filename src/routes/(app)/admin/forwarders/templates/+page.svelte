<script lang="ts">
  import { ForwarderTemplatesEditor, UserAvatar } from "$components";
  import { BodyContainer } from "$layouts";
  import {
    onEvent,
    _t,
    ForwarderTemplatesModel,
    type IForwarderTemplate,
    ParameterValueOwnerBy,
  } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new ForwarderTemplatesModel();
  let templates = $state<IForwarderTemplate[]>([]);
  let loading = $state(true);

  const findForwarderTemplates = async () => {
    try {
      loading = true;
      templates = await api.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching forward templates:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findForwarderTemplates);

  onDestroy(
    onEvent<IForwarderTemplate>(
      "forwardTemplate:created",
      (d: IForwarderTemplate) => {
        const index = templates.findIndex((x) => x.id === d.id);
        if (index !== -1) {
          templates[index] = d;
          return;
        }
        templates.push(d);
      },
    ),
  );
  const removeTemplate = (template: IForwarderTemplate) => {
    templates = templates.filter((t) => t.id !== template.id);
  };
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Forward Templates...")}</P>
  {:else if templates.length === 0}
    <P class="text-center">{$_t("No Forward Templates found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each templates as template}
        <AccordionItem>
          {#snippet header()}
            <div class="flex items-center space-x-2">
              <UserAvatar size="md" type="forwarder" avatar={template.avatar} />
              <Heading tag="h5">{template.name}</Heading>
            </div>
          {/snippet}
          <ForwarderTemplatesEditor
            ondestroy={removeTemplate}
            value={template}
          />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
