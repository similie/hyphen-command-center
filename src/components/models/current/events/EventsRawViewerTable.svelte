<script lang="ts">
  import { DateFormat } from "$components";
  import {
    type IHeartbeat,
    type DevicePayloadMessage,
    type FireHoseEvent,
    ParseSocketMessage,
    type SocketMessage,
    _t,
    Debounce,
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
  import { onDestroy, onMount } from "svelte";
  let {
    events,
    selected = $bindable(),
    onselect,
    removeDevice = false,
    onScrollToBottom,
  } = $props<{
    events: SocketMessage<FireHoseEvent>[];
    selected?: SocketMessage<FireHoseEvent>;
    onselect?: (event: SocketMessage) => void;
    removeDevice?: boolean;
    onScrollToBottom?: () => Promise<void> | void;
  }>();
  let scrollContainer = $state<HTMLDivElement | undefined>();
  let isLoading = $state(false);
  let lastScrollTop = $state(0);
  const debounce = new Debounce();
  const handleScroll = debounce.bounce(async () => {
    if (!scrollContainer || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const isScrollingDown = scrollTop > lastScrollTop;
    lastScrollTop = scrollTop; // update for next tick

    // fire only when scrolling *down* near bottom
    if (
      isScrollingDown &&
      distanceFromBottom < 100 &&
      typeof onScrollToBottom === "function"
    ) {
      isLoading = true;
      await onScrollToBottom();
      isLoading = false;
    }
  }, 200);

  const parseMessage = (message: string) => {
    const parsed = ParseSocketMessage<DevicePayloadMessage | IHeartbeat>(
      message,
    );
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

  onMount(() => {
    setTimeout(() => {
      scrollContainer?.addEventListener("scroll", handleScroll);
    }, 500);
  });

  onDestroy(() => {
    scrollContainer?.removeEventListener("scroll", handleScroll);
  });
</script>

<div class="flex flex-col w-full h-full">
  <Card class="w-full  dark:bg-gray-950 flex flex-col p-2 pt-6 pb-6 max-w-full">
    {#if !events || !events.length}
      <div
        class="p-2 rounded-2xl border-primary-100 border inset-2 shadow shadow-primary-600"
      >
        <Heading tag="h5" class="text-center "
          >{$_t("Waiting For Events")} <Spinner size={"4"} /></Heading
        >
      </div>
    {:else}
      <div class="flex w-full space-x-4">
        <EventHeading {events} {onSearch} />
      </div>
      <Hr />
      <div bind:this={scrollContainer} class=" max-h-screen overflow-y-auto">
        <Table shadow hoverable striped>
          <TableHead>
            <TableHeadCell>{$_t("Event")}</TableHeadCell>
            <TableHeadCell>{$_t("Data")}</TableHeadCell>
            {#if !removeDevice}
              <TableHeadCell>{$_t("Device")}</TableHeadCell>
            {/if}
            <TableHeadCell>{$_t("Published")}</TableHeadCell>
          </TableHead>

          <TableBody>
            {#each localEvents() as event (event._uid)}
              {@const parsedEvent = parseMessage(event.message)}
              {@const active = event._uid === selected?._uid}

              <TableBodyRow
                color={active ? "primary" : undefined}
                onclick={() => setSelected(event)}
                class="hover:cursor-pointer dark:border-primary-200 border-primary-700  {active
                  ? 'text-white dark:text-white'
                  : ''}"
              >
                <TableBodyCell>
                  {event.topic.length > 20
                    ? `${event.topic.substring(0, 20)}...`
                    : event.topic}
                </TableBodyCell>
                <TableBodyCell>
                  {#if typeof parsedEvent === "string"}
                    {((parsedEvent as string) || "").substring(0, 20)}
                  {:else if typeof parsedEvent === "number"}
                    {((parsedEvent as number) ?? "")
                      .toString()
                      .substring(0, 20)}
                  {:else if "payload" in parsedEvent}
                    {`${JSON.stringify(parsedEvent.payload || {})}`.substring(
                      0,
                      20,
                    )}
                  {:else}
                    {`${JSON.stringify(parsedEvent || {})}`.substring(0, 20)}
                  {/if}
                </TableBodyCell>
                {#if !removeDevice}
                  <TableBodyCell>
                    {#if event.device}
                      {event.device.name || event.device.identity}
                    {:else if parsedEvent && "device" in parsedEvent}
                      {parsedEvent.device}
                    {:else}
                      {$_t("Unknown Device")}
                    {/if}
                  </TableBodyCell>
                {/if}
                <TableBodyCell>
                  <DateFormat stamp={parsedEvent.date || new Date()} />
                </TableBodyCell>
              </TableBodyRow>
            {/each}

            {#if isLoading}
              <TableBodyRow>
                <TableBodyCell
                  colspan={removeDevice ? 3 : 4}
                  class="text-center"
                >
                  <Spinner size="4" />
                </TableBodyCell>
              </TableBodyRow>
            {/if}
          </TableBody>
        </Table>
      </div>
    {/if}
  </Card>
</div>
