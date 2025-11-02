<script lang="ts">
  import type { Snippet } from "svelte";

  let { bodyContent, headerContent, children } = $props<{
    headerContent: Snippet;
    bodyContent?: Snippet;
    children?: Snippet;
  }>();
</script>

<div class="flex w-full flex-grow flex-col space-y-4">
  <div class="  mx-auto w-full">
    {@render headerContent()}
  </div>
  <div class="grow mx-auto w-full">
    {@render bodyContent()}
  </div>

  {@render children?.()}
</div>
