<script lang="ts">
  import { page } from "$app/state";
  import { HeaderContentWrapper } from "$layouts";
  import DeviceFirmwareEditor from "./DeviceFirmwareEditor.svelte";
  import DeviceProfileEditor from "./DeviceProfileEditor.svelte";
  import DeviceSensorEditor from "./DeviceSensorEditor.svelte";

  let activeUrl = $derived(page.url.pathname);
</script>

<HeaderContentWrapper>
  {#if activeUrl.includes("devices/firmware")}
    <DeviceFirmwareEditor />
  {:else if activeUrl.includes("devices/sensors")}
    <DeviceSensorEditor />
  {:else}
    <DeviceProfileEditor />
  {/if}
</HeaderContentWrapper>
