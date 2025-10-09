<script lang="ts">
  import { DateFormat } from "$components";
  import {
    type DeviceHeartbeatMessage,
    type DevicePayloadMessage,
    type FireHoseEvent,
    ParseSocketMessage,
    type SocketMessage,
    _t,
  } from "$lib";
  import {
    Card,
    Heading,
    Hr,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import EventHeading from "./EventHeading.svelte";
  let {
    events,
    selected = $bindable(),
    onselect,
  } = $props<{
    events: SocketMessage<FireHoseEvent>[];
    selected?: SocketMessage<FireHoseEvent>;
    onselect?: (event: SocketMessage) => void;
  }>();

  const parseMessage = (message: string) => {
    const parsed = ParseSocketMessage<
      DevicePayloadMessage | DeviceHeartbeatMessage
    >(message);
    return parsed;
  };

  const setSelected = (event: SocketMessage<FireHoseEvent>) => {
    selected = event;
    onselect && onselect(selected);
  };
  let search = $state("");
  let localEvents = $derived(() => {
    if (!search) {
      return events;
    }

    return events.filter((e: SocketMessage<FireHoseEvent>) => {
      return JSON.stringify(e || {})
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  });

  const onSearch = (text: string) => {
    search = text;
  };
</script>

<div class="flex flex-col w-full h-full max-h-screen overflow-y-auto">
  <Card class="w-full  dark:bg-gray-950 flex flex-col p-2 pt-6 pb-6 max-w-full">
    {#if !events || !events.length}
      <div
        class="p-2 rounded-2xl border-primary-100 border inset-2 shadow-md shadow-primary-600"
      >
        <Heading tag="h5" class="text-center "
          >{$_t("Waiting For Events")} <Spinner size={"4"} /></Heading
        >
      </div>
    {:else}
      <div class="flex w-full space-x-4">
        <EventHeading bind:events {onSearch} />
      </div>
      <Hr />
      <Table shadow hoverable striped>
        <TableHead>
          <TableHeadCell>{$_t("Event")}</TableHeadCell>
          <TableHeadCell>{$_t("Data")}</TableHeadCell>
          <TableHeadCell>{$_t("Device")}</TableHeadCell>
          <TableHeadCell>{$_t("Published")}</TableHeadCell>
        </TableHead>

        <TableBody>
          {#each localEvents() as event (event._uid)}
            {@const parsedEvent = parseMessage(event.message)}
            {@const active = event._uid === selected?._uid}

            <TableBodyRow
              color={active ? "primary" : undefined}
              onclick={() => setSelected(event)}
              class="hover:cursor-pointer dark:border-primary-200 border-primary-700 {active
                ? 'text-white dark:text-white'
                : ''}"
            >
              <TableBodyCell>
                {event.topic}
              </TableBodyCell>
              <TableBodyCell>
                {#if "payload" in parsedEvent}
                  {`${JSON.stringify(parsedEvent.payload || {})}`.substring(
                    0,
                    20,
                  )}
                {:else}
                  {`${JSON.stringify(parsedEvent || {})}`.substring(0, 20)}
                {/if}
              </TableBodyCell>

              <TableBodyCell>
                {parsedEvent.device}
              </TableBodyCell>
              <TableBodyCell>
                <DateFormat stamp={parsedEvent.date || new Date()} />
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    {/if}
  </Card>
</div>
