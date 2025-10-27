<script lang="ts">
  import {
    ForwardersModel,
    _t,
    ParameterValueOwnerBy,
    type IDevice,
    type IForwarders,
    onEvent,
    siteUser,
    UserRoles,
  } from "$lib";
  import { Accordion, Button, Heading, Modal, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import ForwarderViewer from "../forwarders/ForwarderViewer.svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  import ForwarderEditor from "../forwarders/ForwarderEditor.svelte";

  let { device } = $props<{ device: IDevice }>();
  const api = new ForwardersModel();
  let forwarders = $state<IForwarders[]>([]);
  let loading = $state(true);
  let createModalOpen = $state(false);
  const pullForwarders = async () => {
    try {
      loading = true;
      forwarders = await api
        .find({ owner: device.id, ownedBy: ParameterValueOwnerBy.DEVICE })
        .sort({ createdAt: "ASC" })
        .fetch();
      console.log("Pulled device forwarders", forwarders);
    } catch (e) {
      console.error("Error fetching device forwarders:", e);
    } finally {
      loading = false;
    }
  };
  onMount(pullForwarders);

  onDestroy(
    onEvent<IForwarders>("forwarder:created", (d: IForwarders) => {
      createModalOpen = false;
      const index = forwarders.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        forwarders[index] = d;
        return;
      }
      forwarders.push(d);
    }),
  );
</script>

<Modal
  bind:open={createModalOpen}
  size="lg"
  title={$_t("Add Device Forwarder")}
>
  <ForwarderEditor
    owner={device.id}
    ownedBy={ParameterValueOwnerBy.DEVICE}
    ownerName={device.name}
  />
</Modal>
{#if loading}
  <P class="text-center">{$_t("Loading Device Forwarders...")}</P>
{:else}
  <div class="flex w-full flex-col mb-4 px-16">
    <Heading tag="h3" class="mb-2">{$_t("Device Forwarders")}</Heading>
    <P class="text-sm">
      {$_t(
        "Device Forwarders allow you to send device data to external systems or services.",
      )}
    </P>
    <Accordion flush={true} class="w-full">
      {#each forwarders as forwarder}
        <ForwarderViewer {forwarder} />
      {/each}
    </Accordion>
    {#if $siteUser && $siteUser.role > UserRoles.MANAGER}
      <div class="flex w-full">
        <Button class="mt-4 " onclick={() => (createModalOpen = true)}
          ><PlusOutline />{$_t("Add Device Forwarder")}</Button
        >
      </div>
    {/if}
  </div>
{/if}
