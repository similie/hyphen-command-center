<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, header } = $props<{ children: Snippet; header?: Snippet }>();
</script>

<div class="flex w-full p-6 flex-grow max-h-[calc(100vh-8rem)]">
  <div class="grow max-w-7xl mx-auto">
    <div class="grid grid-cols-3 gap-3 w-full justify-center">
      {@render header?.()}
    </div>
    {@render children()}
  </div>
</div>
