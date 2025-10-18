<script lang="ts">
  import { page } from "$app/state";
  import {
    Navbar,
    PageFooter,
    CreatePopOutDetails,
    ForwardCreateElements,
  } from "$components";

  import BasicModelPage from "$layouts/BasicModelPage.svelte";
  import { _t, siteUser, UserRoles } from "$lib";
  import { NavLi, NavUl, Button } from "flowbite-svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  import { onDestroy, onMount, type Snippet } from "svelte";
  let { children } = $props<{ children: Snippet }>();

  onMount(async () => {});

  onDestroy(() => {});

  let openDrawer = $state(true);
  let activeUrl = $derived(page.url.pathname);
</script>

<BasicModelPage open={false} bind:openDrawer>
  {#snippet header()}
    {#if activeUrl.includes("forwarders/decoders")}
      <CreatePopOutDetails
        name="Decoders"
        message="Create a new decoder that converts incoming data to a different format"
      />
    {:else if activeUrl.includes("forwarders/templates")}
      <CreatePopOutDetails
        name="Templates"
        message="Create a new template that makes it easier to set up forwarders"
      />
    {:else if activeUrl.includes("forwarders/forwardmaps")}
      <CreatePopOutDetails
        name="Forward Maps"
        message="Create a new forward map that converts incoming data to a different format"
      />
    {:else}
      <CreatePopOutDetails
        name="Forwarders"
        message="Create a new forwarder that delivers data to an external system"
      />
    {/if}
  {/snippet}

  {#snippet body()}
    <ForwardCreateElements />
  {/snippet}
  {#snippet headerContent()}
    <Navbar title="Forwarders"
      >{#snippet createSection()}
        {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
          <Button type="button" onclick={() => (openDrawer = !openDrawer)}
            ><PlusOutline />
            {#if activeUrl.includes("forwarders/decoders")}
              {$_t("Create a decoder")}
            {:else if activeUrl.includes("forwarders/forwardmaps")}
              {$_t("Create a forward map")}
            {:else if activeUrl.includes("forwarders/templates")}
              {$_t("Create a template")}
            {:else}
              {$_t("Create a forwarder")}
            {/if}
          </Button>
        {/if}
      {/snippet}
      {#snippet navLi()}
        <NavUl {activeUrl}>
          <NavLi href="/admin/forwarders">{$_t("Forwarder")}</NavLi>
          <NavLi href="/admin/forwarders/templates">{$_t("Templates")}</NavLi>
          <NavLi href="/admin/forwarders/forwardmaps"
            >{$_t("Forward Maps")}</NavLi
          >
          <NavLi href="/admin/forwarders/decoders">{$_t("Decoders")}</NavLi>
        </NavUl>
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    {@render children()}
  {/snippet}
</BasicModelPage>

<PageFooter />
