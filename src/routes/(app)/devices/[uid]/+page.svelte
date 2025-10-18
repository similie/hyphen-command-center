<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import DeviceViewPage from "$components/models/current/devices/DeviceViewPage.svelte";
  import Navbar from "$components/navbar/Navbar.svelte";
  import BasicModelPage from "$layouts/BasicModelPage.svelte";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import {
    type CrumbHeading,
    _t,
    addNavbarCrumb,
    removeNavbarCrumb,
    NavbarCrumbs,
  } from "$lib";
  import { onDestroy, onMount } from "svelte";
  if (!page.data.device) {
    goto("/devices");
  }
  let closeNav = $state(true);
  let device = $state(page.data.device);
  const headings: CrumbHeading[] = [
    { title: "Devices", href: "/devices" },
    { title: device?.name || "Device" },
  ];

  onMount(() => {
    addNavbarCrumb(headings);
  });

  onDestroy(() => {
    removeNavbarCrumb(headings.map((h) => h.title));
  });
</script>

<BasicModelPage bind:openDrawer={closeNav}>
  {#snippet header()}
    <span>NOOP</span>
  {/snippet}

  {#snippet body()}
    <span>NOOP</span>
  {/snippet}
  {#snippet headerContent()}
    <Navbar title="Devices" headings={$NavbarCrumbs}
      >{#snippet createSection()}
        <span></span>
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    <BodyContainer width={8}>
      <DeviceViewPage {device} />
    </BodyContainer>
  {/snippet}
</BasicModelPage>
