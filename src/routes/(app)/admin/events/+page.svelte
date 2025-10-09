<script lang="ts">
  import { EventsRawViewer } from "$components";
  import Navbar from "$components/navbar/Navbar.svelte";
  import BasicModelPage from "$layouts/BasicModelPage.svelte";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import {
    type CrumbHeading,
    type FireHoseEvent,
    type SocketMessage,
    LocalSocket,
    _t,
    addNavbarCrumb,
    removeNavbarCrumb,
    NavbarCrumbs,
  } from "$lib";
  import { onDestroy, onMount } from "svelte";
  let events = $state<SocketMessage<FireHoseEvent>[]>([] as SocketMessage[]);
  const firehose = (event: SocketMessage<FireHoseEvent>) => {
    const saved = [...events];
    saved.unshift(event);
    events = saved;
  };

  const headings: CrumbHeading[] = [{ title: "Settings" }, { title: "Events" }];

  onMount(() => {
    addNavbarCrumb(headings);
    LocalSocket.instance.listen("firehose", firehose);
  });

  onDestroy(() => {
    removeNavbarCrumb(headings.map((h) => h.title));
    LocalSocket.instance.forget("firehose", firehose);
  });
</script>

<BasicModelPage>
  {#snippet header()}{/snippet}

  {#snippet body()}{/snippet}
  {#snippet headerContent()}
    <Navbar title="Events" headings={$NavbarCrumbs}
      >{#snippet createSection()}
        <!-- BOOMO -->
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    <BodyContainer width={8}>
      <EventsRawViewer {events} />
    </BodyContainer>
  {/snippet}
</BasicModelPage>
