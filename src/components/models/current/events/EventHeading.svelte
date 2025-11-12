<script lang="ts">
  import { _t, Debounce, type FireHoseEvent, siteUser, UserRoles } from "$lib";
  import { Button, Card, Popover, Search, Tooltip } from "flowbite-svelte";
  import { PaperPlaneOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import EventsSendDataForm from "./EventsSendDataForm.svelte";

  let { events = $bindable(), onSearch } = $props<{
    events: FireHoseEvent;
    onSearch?: (text: string) => void;
  }>();

  let search = $state("");

  const debounce = new Debounce();
  const searchChanged = debounce.bounce(() => {
    onSearch && onSearch(search);
  }, 500);
  let editable = $derived($siteUser && $siteUser.role >= UserRoles.MANAGER);
</script>

<Button onclick={() => (events.length = 0)} size="xs" outline class="">
  <Tooltip>{$_t("Clear Data")}</Tooltip>
  <TrashBinOutline />
</Button>
{#if editable}
  <Button id="publish" size="xs" outline class="">
    <Tooltip>{$_t("Publish an Event")}</Tooltip>
    <PaperPlaneOutline />
  </Button>
{/if}
<Popover
  placement="bottom-start"
  title={$_t("Publish an Event")}
  triggeredBy="#publish"
  trigger="click"
>
  <Card class="p-3  space-y-4  w-96">
    <EventsSendDataForm onSent={() => true} />
  </Card>
</Popover>

<Search
  classes={{ input: "rounded-full" }}
  size="md"
  bind:value={search}
  oninput={searchChanged}
/>
