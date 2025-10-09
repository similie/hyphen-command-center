<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    grow,
    shrink,
    class: className,
  } = $props<{
    children: Snippet;
    grow?: boolean;
    shrink?: boolean;
    class?: string;
  }>();
</script>

<div class="{!shrink ? 'w-full' : ''} {grow ? 'flex-grow' : ''} {className}">
  {@render children()}
</div>
