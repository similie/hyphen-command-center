<script lang="ts">
  import Asterisk from "@tabler/icons-svelte/icons/asterisk";
  import { Label, Span } from "flowbite-svelte";
  import { _t } from "$lib";
  import type { Snippet } from "svelte";

  let {
    content,
    for: id,
    class: classes,
    children,
    requiredColor = "red",
    color,
  } = $props<{
    content: string;
    for?: string;
    class?: string;
    children?: Snippet;
    requiredColor?: string;
    color?:
      | "disabled"
      | "primary"
      | "secondary"
      | "green"
      | "emerald"
      | "red"
      | "blue"
      | "yellow"
      | "orange"
      | "gray"
      | "teal"
      | "cyan"
      | "sky"
      | "indigo"
      | "lime"
      | "amber"
      | "violet"
      | "purple"
      | "fuchsia"
      | "pink"
      | "rose"
      | undefined;
  }>();
</script>

<Label {color} for={id} class="{classes || ''} flex items-center  space-x-1">
  <div class="flex space-x-1">
    <Span>{$_t(content)}</Span>
    <Asterisk color={requiredColor} size={8} class="mt-1" />
  </div>
  {#if children}
    {@render children()}
  {/if}
</Label>
