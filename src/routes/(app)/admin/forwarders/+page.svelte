<script lang="ts">
  import { ForwarderViewer } from "$components";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import {
    onEvent,
    _t,
    ForwardersModel,
    type IForwarders,
    ParameterValueOwnerBy,
  } from "$lib";
  import { Accordion, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new ForwardersModel();
  let forwarders = $state<IForwarders[]>([]);
  let loading = $state(true);

  const findForwardMaps = async () => {
    try {
      loading = true;
      forwarders = await api
        .find({ ownedBy: ParameterValueOwnerBy.SYSTEM })
        .sort({ createdAt: "ASC" })
        .fetch();
    } catch (e) {
      console.error("Error fetching forward maps:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findForwardMaps);

  onDestroy(
    onEvent<IForwarders>("forwarder:created", (d: IForwarders) => {
      const index = forwarders.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        forwarders[index] = d;
        return;
      }
      forwarders.push(d);
    }),
  );

  const onDelete = (val: IForwarders) => {
    forwarders = forwarders.filter((f) => f.id !== val.id);
  };
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Forwarders...")}</P>
  {:else if forwarders.length === 0}
    <P class="text-center">{$_t("No Site-Level Forwarders Found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each forwarders as _forwarder, index}
        <ForwarderViewer {onDelete} bind:forwarder={forwarders[index]} />
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
