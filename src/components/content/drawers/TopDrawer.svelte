<script lang="ts">
  import { Drawer, CloseButton, Drawerhead } from "flowbite-svelte";
  import type { Snippet } from "svelte";
  import { sineIn } from "svelte/easing";

  let {
    hidden = $bindable(true),
    // children,
    header,
    body,
    open = $bindable(false),
  } = $props<{
    hidden: boolean;
    header: Snippet;
    body: Snippet;
    open?: boolean;
  }>();

  let transitionParamsTop = {
    y: -320,
    duration: 200,
    easing: sineIn,
  };

  const closeHeader = () => {
    hidden = true;
  };
</script>

<Drawer
  placement="top"
  outsideclose={false}
  width="full"
  transitionParams={transitionParamsTop}
  bind:hidden
  dismissable={false}
  bind:open
>
  <div class="flex items-center">
    {@render header()}
    <CloseButton onclick={closeHeader} class="mb-4ml-auto" />
  </div>
  {@render body()}
</Drawer>
