<script lang="ts">
  import { CreateNewDevice, CreatePopOutDetails } from "$components";
  import DevicesTable from "$components/models/current/devices/DevicesTable.svelte";
  import Navbar from "$components/navbar/Navbar.svelte";
  import { HeaderContentWrapper } from "$layouts";
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
  import { Button } from "flowbite-svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  import { onDestroy, onMount } from "svelte";
  let closeNav = $state(true);
  const headings: CrumbHeading[] = [{ title: "Devices" }];

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
      message="Create a new device to connect to Hyphen Command Center"
    />
  {/snippet}

  {#snippet body()}
    <HeaderContentWrapper>
      <CreateNewDevice />
    </HeaderContentWrapper>
  {/snippet}
  {#snippet headerContent()}
    <Navbar title="Devices" headings={$NavbarCrumbs}
      >{#snippet createSection()}
        {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
          <Button type="button" onclick={() => (closeNav = false)}
            ><PlusOutline /> {$_t("Create a device")}</Button
          >
        {/if}
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    <BodyContainer width={8}>
      <DevicesTable />
    </BodyContainer>
  {/snippet}
</BasicModelPage>
