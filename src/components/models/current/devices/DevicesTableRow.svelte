<script lang="ts">
  import { DateFormat, Toast } from "$components";
  import { DeviceModel, type IDevice, _t } from "$lib";
  import { TableBodyCell, Popover, Button, A, Spinner } from "flowbite-svelte";
  import DeviceStatus from "./DeviceStatus.svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";

  let {
    device,
    onRemove,
    editable = true,
  } = $props<{
    device: IDevice;
    editable?: boolean;
    onRemove: (device: IDevice) => void;
  }>();
  const api = new DeviceModel();
  let showRemove = $state(false);
  let deleting = $state(false);
  const onRemoveLocal = async () => {
    try {
      deleting = true;
      await api
        .destroy({ id: device.id })
        .then(() => {
          Toast.success("Device removed successfully");
          showRemove = false;
          onRemove(device);
        })
        .catch((error) => {
          console.error("Error removing device:", error);
          Toast.error("Error removing device");
        });
    } catch (error) {
      console.error("Error removing device:", error);
    } finally {
      deleting = false;
    }
  };
</script>

<DestroyModelModal
  bind:open={showRemove}
  onDestroy={onRemoveLocal}
  title={$_t("Remove Device")}
  body={$_t("Are you sure you want to remove this device?")}
/>

<TableBodyCell>
  <div class="sr-only">{device.identity}</div>
  <div class="flex items-center space-x-2">
    <DeviceStatus {device} />
    <div>{device.identity}</div>
  </div>
</TableBodyCell>
<TableBodyCell>{device.name}</TableBodyCell>
<TableBodyCell><DeviceStatus {device} text /></TableBodyCell>
<TableBodyCell
  >{#if device.lastTouched}
    <DateFormat stamp={device.lastTouched} />
  {:else}
    {$_t("Never")}
  {/if}
</TableBodyCell>
{#if editable}
  <TableBodyCell>
    <Button
      color="alternative"
      size="xs"
      onclick={(e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {#if !deleting}
        <Popover trigger="click" placement="bottom">
          <A
            disabled={deleting}
            onclick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              showRemove = true;
            }}>{$_t("Remove Device")}</A
          >
        </Popover>
        <DotsHorizontalOutline size={"sm"} />
      {:else}
        <Spinner size={"4"} />
      {/if}
    </Button>
  </TableBodyCell>
{/if}
