<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { CreatePopOutDetails, DeviceFlashTools } from "$components";
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
    siteUser,
    UserRoles,
  } from "$lib";
  import { GradientButton } from "flowbite-svelte";
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
    <CreatePopOutDetails
      name="Devices"
      message="Flash your ESP32 device with Hyphen Command Center"
    />
  {/snippet}

  {#snippet body()}
    <div class="flex w-full">
      <div class="grow max-w-2xl mx-auto w-full h-1/2 overflow-y-auto">
        <DeviceFlashTools {device} />
      </div>
    </div>
  {/snippet}
  {#snippet headerContent()}
    <Navbar title="Devices" headings={$NavbarCrumbs}
      >{#snippet createSection()}
        {#if $siteUser && $siteUser.role >= UserRoles.MANAGER}
          <GradientButton
            outline
            color="cyanToBlue"
            onclick={() => (closeNav = !closeNav)}
            >{$_t("Flash Utilities")}</GradientButton
          >
        {/if}
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    <BodyContainer width={8}>
      <DeviceViewPage {device} />
    </BodyContainer>
  {/snippet}
</BasicModelPage>
