<script lang="ts">
  import type { Snippet } from "svelte";
  let {
    children,
    width = 4,
    class: className,
  } = $props<{
    class?: string;
    children: Snippet;
    width?: number;
  }>();
</script>

<div class="flex w-full pl-6 pr-6 flex-grow {className}">
  <div class="grow max-w-{width}xl mx-auto w-full">
    {@render children()}
  </div>
</div>
