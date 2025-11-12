<script lang="ts">
  import type { IDevice, UUID } from "$lib";
  import {
    type FireHoseEvent,
    type SocketMessage,
    LocalSocket,
    _t,
    siteUser,
    UserRoles,
    DeviceStream,
    decodeBufferJson,
  } from "$lib";
  import { onDestroy, onMount } from "svelte";
  import DeviceEventsViewer from "./DeviceEventsViewer.svelte";
  import DeviceDetails from "./DeviceDetails.svelte";
  import DeviceHeartbeat from "./DeviceHeartbeat.svelte";
  import DeviceLocationDetails from "./DeviceLocationDetails.svelte";
  import { Accordion, AccordionItem, Heading } from "flowbite-svelte";
  import DeviceForwarders from "./DeviceForwarders.svelte";
  import DeviceSensors from "./DeviceSensors.svelte";
  let { device } = $props<{ device: IDevice }>();
  let events = $state<SocketMessage<FireHoseEvent>[]>([]);
  const eventName = $derived(`device/${device.identity}`);
  const api = new DeviceStream();
  const socketEvents = (event: SocketMessage<FireHoseEvent>) => {
    events = [event, ...events];
    if (!event.device) {
      return;
    }
    device.lastTouched = event.device.lastTouched;
  };
  const limit = 50;
  let count = $state(0);
  let pulledCount = $state(0);
  const idSet = new Set<UUID>();

  const pullCount = () => {
    return api
      .count({ device: device.identity })
      .then((c) => {
        return c;
      })
      .catch((e) => {
        console.error("Error counting device events", e);
        return 0;
      });
  };

  const pullHistory = async () => {
    try {
      return await api
        .find({ device: device.identity })
        .sort({ createdAt: "DESC" })
        .limit(limit)
        .skip(pulledCount)
        .fetch()
        .then(
          (fetched) =>
            fetched
              .map((f) => {
                const payload = decodeBufferJson(
                  f.payload as { type: string; data: number[] },
                );
                // we do this because our dataset is constantly growing and we don't want duplicates
                if (idSet.has(f.id as UUID)) {
                  return null;
                }
                pulledCount++;
                idSet.add(f.id as UUID);
                return {
                  message: payload,
                  topic: f.topic,
                  _uid: f.id as UUID,
                  device: $state.snapshot(device) as IDevice,
                } as SocketMessage;
              })
              .filter((f) => f !== null) as SocketMessage[],
        );
    } catch (e) {
      console.error("Error pulling history", e);
    }
    return [] as SocketMessage[];
  };

  onMount(() => {
    pullCount()
      .then((c) => (count = c))
      .then(() =>
        pullHistory()
          .then((fetched: SocketMessage[]) => {
            events = fetched;
            LocalSocket.instance.listen(eventName, socketEvents);
          })
          .catch((e) => {
            console.error("Error fetching device events", e);
          }),
      );
  });

  onDestroy(() => {
    LocalSocket.instance.forget(eventName, socketEvents);
  });

  const onScrollToBottom = async () => {
    if (pulledCount >= count) {
      return;
    }
    try {
      await pullHistory().then((fetched: SocketMessage[]) => {
        events = [...events, ...fetched];
      });
    } catch (e) {
      console.error("Error fetching more device events", e);
    }
  };

  let editable = $derived(
    ($siteUser?.role || UserRoles.UNRESTRICTED) >= UserRoles.MANAGER,
  );
</script>

<div class="w-full flex flex-col space-y-4">
  <Accordion flush={true} class="w-full">
    <AccordionItem>
      {#snippet header()}
        <Heading tag="h5">{$_t("Device Details")}</Heading>
      {/snippet}
      <div
        class="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 w-full"
      >
        <DeviceDetails {editable} {device} />
        <DeviceHeartbeat {device} />
        <DeviceLocationDetails {editable} {device} />
      </div>
    </AccordionItem>
    <AccordionItem>
      {#snippet header()}
        <Heading tag="h5">{$_t("Integrations")}</Heading>
      {/snippet}
      <div class="flex flex-wrap md:flex-nowrap space-x-4 space-y-4">
        <DeviceSensors {editable} {device} />
        <DeviceForwarders {editable} {device} />
      </div>
    </AccordionItem>
  </Accordion>
  <DeviceEventsViewer {editable} {events} {device} {onScrollToBottom} />
</div>
