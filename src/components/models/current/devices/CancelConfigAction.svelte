<script lang="ts">
  import {
    DeviceConfigEnum,
    DeviceConfigModel,
    _t,
    type IDeviceConfig,
    type UUID,
  } from "$lib";
  import { CloseButton } from "flowbite-svelte";
  import { DestroyModelModal } from "$components/models/destroy";

  let { loadedConfig, onRemove } = $props<{
    loadedConfig: IDeviceConfig;
    onRemove: () => void;
  }>();
  const api = new DeviceConfigModel();
  let confirmedConfig = $state<boolean>(false);

  const cancelConfig = async () => {
    if (!loadedConfig) {
      return (confirmedConfig = false);
    }
    try {
      await api.update(
        { id: loadedConfig?.id || ("" as UUID) },
        { state: DeviceConfigEnum.CANCELED },
      );
      onRemove();
    } catch (e) {
      console.error("Error cancelling config:", e);
    }
  };
</script>

<DestroyModelModal
  bind:open={confirmedConfig}
  onDestroy={cancelConfig}
  btnText="Proceed to Cancel"
  title="Confirm Cancel"
  body="Are you sure you want to cancel this configuration request?"
/>
{#if loadedConfig}
  <CloseButton
    size="xs"
    onclick={() => (confirmedConfig = true)}
    class="m-0 absolute top-0 -right-1 z-10 bg-red-600 shadow-md inset text-white rounded-2xl p-1"
  />
{/if}
