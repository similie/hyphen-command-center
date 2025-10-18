<script lang="ts">
  import {
    DeviceConfigActionType,
    DeviceConfigEnum,
    DeviceConfigModel,
    LocalSocket,
    _t,
    type IDevice,
    type IDeviceConfig,
  } from "$lib";
  import FunctionCallerValue from "./FunctionCallerValue.svelte";
  import { onDestroy, onMount } from "svelte";
  import CancelConfigAction from "./CancelConfigAction.svelte";

  let { device, func, pending } = $props<{
    device: IDevice;
    func: string;
    pending: IDeviceConfig[];
  }>();
  let pendingVar = $derived(
    pending
      .filter(
        (p: IDeviceConfig) => p.actionType === DeviceConfigActionType.FUNCTION,
      )
      .find((p: IDeviceConfig) => p.actionName === func),
  );
  let loadedConfig = $state<IDeviceConfig | undefined>(undefined);
  const api = new DeviceConfigModel();
  let loading = $state(false);
  let setValue = $state<string>("");
  let confirmedConfig = $state<boolean>(false);
  const createConfig = (data: string): Partial<IDeviceConfig> => {
    return {
      identity: device.identity,
      actionName: func,
      actionType: DeviceConfigActionType.FUNCTION,
      data,
      state: DeviceConfigEnum.WAITING,
    };
  };

  const configSocket = (message: IDeviceConfig) => {
    if (!loadedConfig || loadedConfig.id !== message.id) {
      return;
    }
    loading = false;
    setValue = message.value || "";
    // loadedConfig = undefined;
  };

  const topicString = $derived(
    DeviceConfigModel.getConfigTopicAction(createConfig("")),
  );

  onMount(() => {
    LocalSocket.instance.listen(topicString, configSocket);
    if (!pendingVar) {
      return;
    }
    loadedConfig = pendingVar;
    setValue = pendingVar.data || "";
    loading = true;
  });

  onDestroy(() => {
    LocalSocket.instance.forget(topicString, configSocket);
  });

  const onCall = async (value: string) => {
    const config = createConfig(value);
    try {
      loading = true;
      const result = await api.create(config);
      loadedConfig = result;
      setValue = result.data || "";
    } catch (e) {
      console.error("Error creating config:", e);
    }
  };
  const onRemove = async () => {
    pending.splice(
      pending.findIndex((p: IDeviceConfig) => p.id === loadedConfig?.id),
      1,
    );
    confirmedConfig = false;
    loading = false;
    loadedConfig = undefined;
  };
</script>

{#if loadedConfig}
  <div class="relative">
    {#if loadedConfig && loading}
      <CancelConfigAction {loadedConfig} {onRemove} />
    {/if}
    <FunctionCallerValue
      callValue={func}
      reset
      onCall={() => (loadedConfig = undefined)}
      {setValue}
      {loading}
    />
  </div>
{:else}
  <FunctionCallerValue callValue={func} {onCall} {loading} />
{/if}
