<script lang="ts">
  import {
    Navbar,
    PageFooter,
    DeviceFleetMap,
    DeviceIndexPage,
  } from "$components";

  import { BasicModelPage } from "$layouts";

  let openDrawer = $state(true);
</script>

<div
  class="flex w-full flex-wrap md:flex-nowrap overflow-y-auto md:overflow-y-clip-"
>
  <div class="flex w-full h-[calc(100vh-4rem)]">
    <BasicModelPage open={false} {openDrawer}>
      {#snippet header()}{/snippet}

      {#snippet body()}{/snippet}
      {#snippet headerContent()}
        <Navbar title="Hyphen Command Center"
          >{#snippet createSection()}{/snippet}</Navbar
        >
      {/snippet}
      {#snippet bodyContent()}
        <DeviceIndexPage />
      {/snippet}
    </BasicModelPage>
  </div>
  <!-- <div class="w-1/2 h-[calc(100vh-2rem)]"> -->
  <div class="w-full h-full md:p-0 p-8">
    <DeviceFleetMap />
  </div>
</div>

<PageFooter />
