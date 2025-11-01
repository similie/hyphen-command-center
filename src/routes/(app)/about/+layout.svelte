<script lang="ts">
  import { _t, NavbarCrumbs } from "$lib";
  import { Navbar } from "$components";
  import { onDestroy, type Snippet } from "svelte";
  import { BasicModelPage } from "$layouts";

  let { children } = $props<{
    children: Snippet;
  }>();

  let openDrawer = $state(true);
  onDestroy(() => {
    openDrawer = true;
  });
</script>

<BasicModelPage bind:openDrawer>
  {#snippet header()}{/snippet}

  {#snippet body()}{/snippet}

  {#snippet bodyContent()}
    {@render children()}
  {/snippet}

  {#snippet headerContent()}
    <Navbar headings={$NavbarCrumbs} title="Similie">
      {#snippet createSection()}
        <!-- <CallToActionButton /> -->
      {/snippet}
    </Navbar>
  {/snippet}
</BasicModelPage>
