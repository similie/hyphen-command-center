<script lang="ts">
  import type { SocketMessage, FireHoseEvent, IDevice } from "$lib";
  import EventsRawViewerData from "../events/EventsRawViewerData.svelte";
  import EventsRawViewerTable from "../events/EventsRawViewerTable.svelte";
  import DeviceConfigControls from "./DeviceConfigControls.svelte";

  let { events, device, onScrollToBottom } = $props<{
    events: SocketMessage<FireHoseEvent>[];
    device: IDevice;
    onScrollToBottom?: () => Promise<void> | void;
  }>();
  let selected = $state<SocketMessage<FireHoseEvent> | undefined>(undefined);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-12 w-full">
  <div class="order-2 md:order-1 col-span-1 md:col-span-5">
    <EventsRawViewerTable
      {onScrollToBottom}
      removeDevice
      bind:selected
      {events}
    />
  </div>
  <div class="order-1 md:order-2 col-span-1 md:col-span-4">
    <EventsRawViewerData event={selected} />
  </div>

  <div class="order-3 md:order-3 col-span-1 md:col-span-3">
    <DeviceConfigControls {device} />
  </div>
</div>
