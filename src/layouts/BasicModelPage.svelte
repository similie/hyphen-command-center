<script lang="ts">
  import { TopDrawer } from "$components";
  import { type Snippet } from "svelte";
  import { BodyContainerWide } from "$layouts";

  let {
    body,
    header,
    bodyContent,
    headerContent,
    openDrawer = $bindable(true),
    open = $bindable(),
  } = $props<{
    open?: boolean;
    body: Snippet;
    header: Snippet;
    bodyContent: Snippet;
    headerContent: Snippet;
    openDrawer?: boolean;
  }>();
</script>

<TopDrawer bind:hidden={openDrawer} {header} {body}></TopDrawer>

<BodyContainerWide {headerContent} {bodyContent}></BodyContainerWide>
