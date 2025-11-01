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
  import { RefreshOutline } from "flowbite-svelte-icons";

  let { device, func, pending } = $props<{
    device: IDevice;
    func: string;
    pending: IDeviceConfig[];
  }>();
  let pendingVar = $derived(
    pending
      .filter(
        (p: IDeviceConfig) =>
          p.actionType === DeviceConfigActionType.FUNCTION && !p.noNullify,
      )
      .find((p: IDeviceConfig) => p.actionName === func),
  );

  let staticConfigValues = $derived(
    pending.filter(
      (p: IDeviceConfig) =>
        p.actionType === DeviceConfigActionType.FUNCTION &&
        p.noNullify &&
        p.actionName === func,
    ),
  );

  let hasStaticCall = $derived(staticConfigValues.length > 0);
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

  const verifyStaticConfig = (config: IDeviceConfig) => {
    if (!staticConfigValues || staticConfigValues.length === 0) {
      return;
    }
    staticConfigValues = staticConfigValues.filter(
      (p: IDeviceConfig) => p.id !== config.id,
    );
    hasStaticCall = staticConfigValues && staticConfigValues.length !== 0;
  };

  const configSocket = (message: IDeviceConfig) => {
    if (!loadedConfig || loadedConfig.id !== message.id) {
      return verifyStaticConfig(message);
    }
    loading = false;
    setValue = message.value || "";
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

{#if loadedConfig && !hasStaticCall}
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
      disabled={hasStaticCall}
    />
  </div>
{:else if hasStaticCall}
  <div class="relative">
    <div class="absolute top-0 right-0">
      <RefreshOutline class="animate-spin" />
    </div>
    <FunctionCallerValue
      callValue={func}
      {onCall}
      loading
      disabled={hasStaticCall}
    />
  </div>
{:else}
  <FunctionCallerValue callValue={func} {onCall} {loading} />
{/if}
