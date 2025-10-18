<script lang="ts">
  import {
    DeviceConfigEnum,
    DeviceConfigModel,
    DeviceRegistration,
    LocalSocket,
    _t,
    type IDevice,
    type IDeviceConfig,
    type SocketMessage,
  } from "$lib";
  import { A, Card, Heading, P, Skeleton } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import FunctionConfigAction from "./FunctionConfigAction.svelte";
  import VariableConfigAction from "./VariableConfigAction.svelte";
  import { RefreshOutline } from "flowbite-svelte-icons";

  let { device } = $props<{
    device: IDevice;
  }>();
  let loading = $state(false);
  const api = new DeviceRegistration();
  const dApi = new DeviceConfigModel();
  const socketName = $derived(`devices/config/${device.identity}`);
  const configSocket = (message: SocketMessage) => {
    console.log("Config Socket Message", message);
  };

  let functions = $state<string[]>([]);
  let variables = $state<string[]>([]);
  let configurations = $state<IDeviceConfig[]>([]);
  const pullRegistry = async () => {
    try {
      loading = true;
      configurations = await dApi
        .find({ state: DeviceConfigEnum.WAITING })
        .fetch();
      const registry = await api
        .find({ identity: device.identity })
        .sort({ createdAt: "DESC" })
        .fetchOne();
      if (!registry) {
        return;
      }
      functions = registry.functions || [];
      variables = registry.variables || [];
    } catch (e) {
      console.error("Error pulling registry", e);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    LocalSocket.instance.listen(socketName, configSocket);
    pullRegistry();
  });
  onDestroy(() => {
    LocalSocket.instance.forget(socketName, configSocket);
  });
</script>

<div class="w-full flex flex-col space-y-4">
  <Card
    class="w-full dark:bg-gray-950 flex flex-col p-6 max-w-full overflow-hidden"
  >
    <Heading tag="h5"
      >{$_t("Functions")}
      <A onclick={pullRegistry}><RefreshOutline /></A></Heading
    >
    {#if loading}
      <Skeleton size="sm" class="my-8" />
    {:else}
      <div class="flex flex-col space-y-2 my-2">
        {#each functions as func}
          <FunctionConfigAction {func} {device} pending={configurations} />
        {/each}
        {#if functions.length === 0}
          <P class="text-sm">
            {$_t("No functions registered for this device.")}
          </P>
        {/if}
      </div>
    {/if}
  </Card>

  <Card
    class="w-full dark:bg-gray-950 flex flex-col p-6 max-w-full overflow-hidden"
  >
    <Heading tag="h5">{$_t("Variables")}</Heading>
    {#if loading}
      <Skeleton size="sm" class="my-8" />
    {:else}
      <div class="flex flex-col space-y-2 my-2">
        {#each variables as variable}
          <VariableConfigAction {variable} {device} pending={configurations} />
        {/each}
        {#if variables.length === 0}
          <P class="text-sm">
            {$_t("No variables registered for this device.")}
          </P>
        {/if}
      </div>
    {/if}
  </Card>
</div>
