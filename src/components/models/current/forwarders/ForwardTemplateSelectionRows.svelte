<script lang="ts">
  import {
    ForwarderTemplatesModel,
    _t,
    type IForwarderTemplate,
    type UUID,
  } from "$lib";
  import { P, Spinner } from "flowbite-svelte";
  import { onMount } from "svelte";
  import ForwardTemplateCard from "./ForwardTemplateCard.svelte";

  let {
    onSelect,
    selected,
    hideOnSelected = false,
  } = $props<{
    onSelect: (template: IForwarderTemplate) => void;
    selected?: UUID;
    hideOnSelected?: boolean;
  }>();

  const api = new ForwarderTemplatesModel();
  let loading = $state(false);
  let templates = $state<IForwarderTemplate[]>([]);
  const pullTemplates = async () => {
    try {
      loading = true;
      templates = await api.find().sort({ name: "ASC" }).fetch();
    } catch (e) {
      console.error("Error pulling forwarder templates", e);
    } finally {
      loading = false;
    }
  };
  onMount(async () => {
    await pullTemplates();
    selected && onSelect(templates.find((t) => t.id === selected)!);
  });
</script>

{#if !hideOnSelected || !selected}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#if loading}
      <P class="text-center"
        >{$_t("Loading Forwarder Templates")} <Spinner />...</P
      >
    {:else if templates.length === 0}
      <P class="text-center">{$_t("No Forwarder Templates found")}.</P>
    {:else}
      {#each templates as template}
        <ForwardTemplateCard
          active={selected === template.id}
          value={template}
          {onSelect}
        />
      {/each}
    {/if}
  </div>
{/if}
