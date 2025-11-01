<script lang="ts">
  import type { Snippet } from "svelte";
  let {
    children,
    width = 4,
    class: className,
    innerClass = "",
  } = $props<{
    class?: string;
    children: Snippet;
    width?: number;
    innerClass?: string;
  }>();
</script>

<div class="flex w-full pl-6 pr-6 flex-grow {className}">
  <div class="grow max-w-{width}xl mx-auto w-full {innerClass}">
    {@render children()}
  </div>
</div>
