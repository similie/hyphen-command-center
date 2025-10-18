<script lang="ts">
  import { ForwardMapEditor } from "$components";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import { ForwardMapModel, onEvent, type IForwardMap, _t } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new ForwardMapModel();
  let maps = $state<IForwardMap[]>([]);
  let loading = $state(true);

  const findForwardMaps = async () => {
    try {
      loading = true;
      maps = await api.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching forward maps:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findForwardMaps);

  onDestroy(
    onEvent<IForwardMap>("forwardMap:created", (d: IForwardMap) => {
      const index = maps.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        maps[index] = d;
        return;
      }
      maps.push(d);
    }),
  );
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Forward Maps...")}</P>
  {:else if maps.length === 0}
    <P class="text-center">{$_t("No Forward Maps found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each maps as map}
        <AccordionItem>
          {#snippet header()}
            <Heading tag="h5">{map.name}</Heading>
          {/snippet}
          <ForwardMapEditor forwardMap={map} />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
