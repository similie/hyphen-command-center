<script lang="ts">
  import {
    type IForwarders,
    LocalSocket,
    type SocketMessage,
    UserRoles,
    _t,
    siteUser,
  } from "$lib";
  import {
    A,
    Accordion,
    AccordionItem,
    Badge,
    Card,
    Heading,
    Label,
    Listgroup,
    ListgroupItem,
    P,
  } from "flowbite-svelte";
  import ForwarderEditor from "./ForwarderEditor.svelte";
  import { onDestroy, onMount } from "svelte";
  import { DateFormat, MarkdownContentRender } from "$components";
  import { CheckOutline } from "flowbite-svelte-icons";

  let { forwarder = $bindable(), onDelete } = $props<{
    forwarder: IForwarders;
    onDelete?: (val: IForwarders) => void;
  }>();
  type SocketMessageWithDate = SocketMessage & { _date: Date };
  let selectedSocket = $state<SocketMessageWithDate | null>(null);
  let socketItems = $state<SocketMessageWithDate[]>([]);

  const forwarderPayload = (socket: SocketMessageWithDate) => {
    console.log("Received socket message:", socket);
    if (!socket) {
      return;
    }
    socketItems.unshift(socket);
    if (socketItems.length > 30) {
      socketItems.pop();
    }
  };

  const listenTo = $derived(`forwarder/${forwarder.id}/artifacts`);

  const derivedContent = $derived(() => {
    if (!selectedSocket) {
      return "";
    }

    try {
      const value = JSON.stringify(selectedSocket, null, 2);
      return value;
    } catch (e) {
      console.error("Error deriving content:", e);
      return selectedSocket;
    }
  });

  onMount(() => {
    LocalSocket.instance.listen(listenTo, forwarderPayload);
  });
  onDestroy(() => {
    LocalSocket.instance.forget(listenTo, forwarderPayload);
  });
</script>

<AccordionItem>
  {#snippet header()}
    <Heading tag="h5">{forwarder.name}</Heading>
  {/snippet}
  {#if $siteUser && $siteUser.role >= UserRoles.MANAGER}
    <Accordion flush>
      <AccordionItem>
        {#snippet header()}
          <Heading class="text-sm" tag="h6">{$_t("Edit Forwarder")}</Heading>
        {/snippet}
        <ForwarderEditor bind:value={forwarder} {onDelete} />
      </AccordionItem>
    </Accordion>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 mt-4 gap-1 w-full justify-center">
    <Card class="p-1 max-w-full dark:bg-gray-950 flex flex-col overflow-hidden">
      {#if socketItems.length}
        <Listgroup>
          {#each socketItems as item, index}
            <ListgroupItem
              active={selectedSocket?._uid === item._uid}
              id={`forwarder-socket-item-${index}`}
            >
              <div class="flex w-full flex-col space-y-2">
                <Label>{$_t("Artifact ID")}</Label>
                <div class="flex items-center space-x-1 w-full">
                  <A href="#" onclick={() => (selectedSocket = item)}>
                    <Heading tag="h6" class="text-sm">{item._uid}</Heading></A
                  >
                  {#if selectedSocket?._uid === item._uid}
                    <Badge class="ml-auto rounded-full"><CheckOutline /></Badge>
                  {/if}
                </div>

                <DateFormat class="text-sm" stamp={item._date} />
              </div>
            </ListgroupItem>
          {/each}
        </Listgroup>
      {:else if socketItems.length === 0}
        <P class="text-center">{$_t("No artifacts received yet")}</P>
      {/if}
    </Card>
    <Card class="p-1 max-w-full dark:bg-gray-950 flex flex-col overflow-hidden">
      {#if selectedSocket}
        <MarkdownContentRender
          content={`\`\`\`json\n${derivedContent()}\n\`\`\``}
        />
      {:else}
        <P class="text-center">{$_t("Select an artifact to view details")}</P>
      {/if}
    </Card>
  </div>
</AccordionItem>
