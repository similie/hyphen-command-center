<script lang="ts">
  import { DeviceFirmwareEditor } from "$components";
  import { BodyContainer } from "$layouts";
  import { onEvent, _t, SourceRepository, type ISourceRepository } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new SourceRepository();
  let repositories = $state<ISourceRepository[]>([]);
  let loading = $state(true);

  const findDeviceProfiles = async () => {
    try {
      loading = true;
      repositories = await api.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching device profiles:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findDeviceProfiles);

  onDestroy(
    onEvent<ISourceRepository>("repository:created", (d: ISourceRepository) => {
      const index = repositories.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        repositories[index] = d;
        return;
      }
      repositories.push(d);
    }),
  );

  const onDelete = (val: ISourceRepository) => {
    repositories = repositories.filter((f) => f.id !== val.id);
  };
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Device Profiles...")}</P>
  {:else if repositories.length === 0}
    <P class="text-center">{$_t("No Device Profiles found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each repositories as _repository, index}
        <AccordionItem>
          {#snippet header()}
            <div class="flex space-x-2 items-center">
              <Heading tag="h5">{_repository.name}</Heading>
            </div>
          {/snippet}
          <DeviceFirmwareEditor
            bind:repository={repositories[index]}
            {onDelete}
          />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
