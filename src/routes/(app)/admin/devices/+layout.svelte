<script lang="ts">
  import { page } from "$app/state";
  import {
    Navbar,
    PageFooter,
    CreatePopOutDetails,
    DeviceCreateElements,
  } from "$components";

  import BasicModelPage from "$layouts/BasicModelPage.svelte";
  import { _t, siteUser, UserRoles } from "$lib";
  import { NavLi, NavUl, Button } from "flowbite-svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  import { type Snippet } from "svelte";
  let { children } = $props<{ children: Snippet }>();

  let openDrawer = $state(true);
  let activeUrl = $derived(page.url.pathname);
</script>

<BasicModelPage open={false} bind:openDrawer>
  {#snippet header()}
    {#if activeUrl.includes("devices/firmware")}
      <CreatePopOutDetails
        name="Firmware Repositories"
        message="Create a new connect your git repository that contains device firmware"
      />
    {:else if activeUrl.includes("devices/sensors")}
      <CreatePopOutDetails
        name="Sensors"
        message="Create a new sensor for your device"
      />
    {:else}
      <CreatePopOutDetails
        name="Device Profiles"
        message="Create a new device profile that defines device capabilities"
      />
    {/if}
  {/snippet}

  {#snippet body()}
    <DeviceCreateElements />
  {/snippet}
  {#snippet headerContent()}
    <Navbar title="Forwarders"
      >{#snippet createSection()}
        {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
          <Button type="button" onclick={() => (openDrawer = !openDrawer)}
            ><PlusOutline />
            {#if activeUrl.includes("devices/firmware")}
              {$_t("Attach Firmware Repository")}
            {:else if activeUrl.includes("devices/sensors")}
              {$_t("Create a Sensor")}
            {:else}
              {$_t("Create a Device Profile")}
            {/if}
          </Button>
        {/if}
      {/snippet}
      {#snippet navLi()}
        <NavUl {activeUrl}>
          <NavLi href="/admin/devices">{$_t("Profiles")}</NavLi>
          <NavLi href="/admin/devices/firmware"
            >{$_t("Firmware Repositories")}</NavLi
          >
          <NavLi href="/admin/devices/sensors">{$_t("Sensors")}</NavLi>
        </NavUl>
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    {@render children()}
  {/snippet}
</BasicModelPage>

<PageFooter />
