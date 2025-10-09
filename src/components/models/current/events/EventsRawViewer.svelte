<script lang="ts">
    import type { SocketMessage, FireHoseEvent } from "$lib";
    import EventsRawViewerData from "./EventsRawViewerData.svelte";
    import EventsRawViewerTable from "./EventsRawViewerTable.svelte";

    let { events } = $props<{ events: SocketMessage<FireHoseEvent>[] }>();
    let selected = $state<SocketMessage<FireHoseEvent> | undefined>(undefined);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 w-full">
    <EventsRawViewerTable bind:selected {events} />

    <EventsRawViewerData event={selected} />
</div>
