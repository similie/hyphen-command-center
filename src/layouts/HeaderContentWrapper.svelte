<script lang="ts">
  import type { Snippet } from "svelte";

  let { children } = $props<{ children: Snippet }>();
</script>

<div class="flex items-center justify-center w-full">
  <div class="flex-grow w-full max-w-3xl p-6 max-h-dvh overflow-y-auto">
    {@render children()}
  </div>
</div>
