<script lang="ts">
  import { DateFormat, MarkdownContentRender, Toast } from "$components";
  import {
    type DevicePayloadMessage,
    type SocketMessage,
    type FireHoseEvent,
    ParseSocketMessage,
    _t,
    copyToClipboard,
  } from "$lib";
  import { Card, P, Clipboard, Hr, Heading, A } from "flowbite-svelte";
  import EventPrettyButtons from "./EventPrettyButtons.svelte";
  import { CheckOutline } from "flowbite-svelte-icons";

  let { event } = $props<{
    event?: SocketMessage<FireHoseEvent>;
  }>();

  let pretty = $state(true);

  const createJsonString = (message: string) => {
    if (!message) {
      return "";
    }

    try {
      JSON.parse(message); // Check if it's already valid JSON
      const obj = ParseSocketMessage<DevicePayloadMessage>(message);
      return `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
    } catch {
      return `${message}`;
    }
  };

  let content = $derived(`${createJsonString(event?.message)}`);
  let success = $state(false);

  let decoded = $derived(
    ParseSocketMessage<DevicePayloadMessage>(event?.message || {}),
  );

  const copyToClipboardLocal = (textToCopy: string) => {
    copyToClipboard(textToCopy, () => {
      Toast.success("Text copied to clipboard");
    });
  };
</script>

<Card
  class="w-full dark:bg-gray-950 flex flex-col p-6 max-w-full overflow-hidden"
>
  <div class="w-full flex flex-col h-full">
    {#if !event}
      <div
        class="p-2 rounded-2xl border-primary-100 border shadow inset-2 shadow-primary-600"
      >
        <Heading tag="h5" class="text-center ">{$_t("Select an Event")}</Heading
        >
      </div>
    {:else}
      <div class="flex space-x-2 mb-4">
        <EventPrettyButtons bind:pretty />
        <Clipboard
          outline
          pill
          bind:value={event.message}
          bind:success
          class="ml-auto"
        >
          {#if success}<CheckOutline />{:else}{$_t("Copy")}{/if}
        </Clipboard>
      </div>

      <Heading tag="h5" class="whitespace-pre-wrap break-words"
        >{event.topic}</Heading
      >
      <P
        >{$_t("Device")}: {event.device ? `${event.device.name} ` || "" : ""}<A
          onclick={() => copyToClipboardLocal(decoded.device)}
          >{decoded.device}</A
        >
        <DateFormat stamp={decoded.date} /></P
      >
      <Hr class="my-4" />
      <div
        class="w-full h-full border-2 border-primary-500 border-dashed rounded-2xl shadow inset-2"
      >
        {#if pretty}
          <div class="rounded-2xl overflow-hidden p-4">
            <MarkdownContentRender {content} />
          </div>
        {:else}
          <div class="w-full p-2 rounded-2xl">
            <P class="whitespace-pre-wrap break-words p-2">{event.message}</P>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</Card>
