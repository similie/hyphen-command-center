<script lang="ts">
  import DecodeEditor from "$components/models/current/forwarders/DecodeEditor.svelte";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import { DecoderModel, onEvent, type IDecoder, _t } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new DecoderModel();
  let decoders = $state<IDecoder[]>([]);
  let loading = $state(true);

  const findDecoders = async () => {
    try {
      loading = true;
      decoders = await api.find().sort({ createdAt: "DESC" }).fetch();
    } catch (e) {
      console.error("Error fetching decoders:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findDecoders);

  onDestroy(
    onEvent<IDecoder>("decoder:created", (d: IDecoder) => {
      const index = decoders.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        decoders[index] = d;
        return;
      }
      decoders.push(d);
    }),
  );
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading decoders...")}</P>
  {:else if decoders.length === 0}
    <P class="text-center">{$_t("No decoders found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each decoders as decoder}
        <AccordionItem>
          {#snippet header()}
            <Heading tag="h5">{decoder.name}</Heading>
          {/snippet}
          <DecodeEditor {decoder} />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
