<script lang="ts">
  import type { Snippet } from "svelte";
  let { children, class: className } = $props<{
    children: Snippet;
    class?: string;
  }>();
</script>

<div class="flex w-full space-x-2 {className} flex-wrap md:flex-nowrap">
  {@render children()}
</div>
