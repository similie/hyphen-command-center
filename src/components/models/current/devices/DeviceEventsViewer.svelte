<script lang="ts">
  import type { SocketMessage, FireHoseEvent, IDevice } from "$lib";
  import EventsRawViewerData from "../events/EventsRawViewerData.svelte";
  import EventsRawViewerTable from "../events/EventsRawViewerTable.svelte";
  import DeviceConfigControls from "./DeviceConfigControls.svelte";

  let {
    events,
    device,
    onScrollToBottom,
    editable = true,
  } = $props<{
    events: SocketMessage<FireHoseEvent>[];
    device: IDevice;
    editable?: boolean;
    onScrollToBottom?: () => Promise<void> | void;
  }>();
  let selected = $state<SocketMessage<FireHoseEvent> | undefined>(undefined);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-{editable ? 12 : 2} w-full">
  <div class="order-2 md:order-1 col-span-1 md:col-span-{editable ? 5 : 1}">
    <EventsRawViewerTable
      {onScrollToBottom}
      removeDevice
      bind:selected
      {events}
    />
  </div>
  <div class="order-1 md:order-2 col-span-1 md:col-span-{editable ? 4 : 1}">
    <EventsRawViewerData event={selected} />
  </div>
  {#if editable}
    <div class="order-3 md:order-3 col-span-1 md:col-span-3">
      <DeviceConfigControls {device} />
    </div>
  {/if}
</div>
