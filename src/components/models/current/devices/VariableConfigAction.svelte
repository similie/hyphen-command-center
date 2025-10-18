<script lang="ts">
  import {
    DeviceConfigActionType,
    DeviceConfigEnum,
    DeviceConfigModel,
    LocalSocket,
    type IDevice,
    type IDeviceConfig,
  } from "$lib";
  import { onDestroy, onMount } from "svelte";
  import FunctionCallerValue from "./FunctionCallerValue.svelte";
  import CancelConfigAction from "./CancelConfigAction.svelte";

  let { device, variable, pending } = $props<{
    device: IDevice;
    variable: string;
    pending: IDeviceConfig[];
  }>();
  let pendingVar = $derived(
    pending
      .filter(
        (p: IDeviceConfig) => p.actionType === DeviceConfigActionType.VARIABLE,
      )
      .find((p: IDeviceConfig) => p.actionName === variable),
  );
  let loadedConfig = $state<IDeviceConfig | undefined>(undefined);
  const api = new DeviceConfigModel();
  let loading = $state(false);
  let setValue = $state<string>("");
  const configSocket = (message: IDeviceConfig) => {
    if (!loadedConfig || loadedConfig.id !== message.id) {
      return;
    }
    loading = false;
    setValue = message.value || "";
    loadedConfig = undefined;
  };

  const createConfig = (): Partial<IDeviceConfig> => {
    return {
      identity: device.identity,
      actionName: variable,
      actionType: DeviceConfigActionType.VARIABLE,
      data: "",
      state: DeviceConfigEnum.WAITING,
    };
  };

  const topicString = $derived(
    DeviceConfigModel.getConfigTopicAction(createConfig()),
  );

  onMount(() => {
    LocalSocket.instance.listen(topicString, configSocket);
    if (!pendingVar) {
      return;
    }
    loadedConfig = pendingVar;
    loading = true;
  });
  onDestroy(() => {
    LocalSocket.instance.forget(topicString, configSocket);
  });

  const onCall = async () => {
    const config = createConfig();
    try {
      loading = true;
      const result = await api.create(config);
      loadedConfig = result;
      console.log("Creating config:", result);
    } catch (e) {
      console.error("Error creating config:", e);
    }
  };

  const onRemove = () => {
    pending.splice(
      pending.findIndex((p: IDeviceConfig) => p.id === loadedConfig?.id),
      1,
    );
    loading = false;
    loadedConfig = undefined;
  };
</script>

<div class="relative">
  <FunctionCallerValue
    callValue={variable}
    disabled
    {loading}
    {setValue}
    {onCall}
  />

  {#if loadedConfig && loading}
    <CancelConfigAction {loadedConfig} {onRemove} />
  {/if}
</div>
