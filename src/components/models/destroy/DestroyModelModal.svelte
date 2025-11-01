<script lang="ts">
  import { Button, Modal, P } from "flowbite-svelte";
  import { _t } from "$lib";
  import type { Snippet } from "svelte";
  let {
    open = $bindable(),
    title,
    body,
    model,
    onDestroy,
    onCancel,
    btnText,
    btnColor = "rose",
    children,
  } = $props<{
    open: boolean;
    model?: any;
    onDestroy?: (model: any) => void;
    onCancel?: (model: any) => void;
    title?: string;
    body?: string;
    btnText?: string;
    children?: Snippet;
    btnColor?:
      | "rose"
      | "primary"
      | "dark"
      | "alternative"
      | "light"
      | "secondary"
      | "gray"
      | "red"
      | "orange"
      | "amber"
      | "yellow"
      | "lime"
      | "green"
      | "emerald"
      | "teal"
      | "cyan"
      | "sky"
      | "blue"
      | "indigo";
  }>();
</script>

<Modal
  oncancel={() => onCancel && onCancel(model)}
  title={title || "Destroy this Content"}
  onclick={(e) => e.stopPropagation()}
  bind:open
>
  <P>{body ? $_t(body) : $_t("Are you sure to delete this content?")}</P>

  {@render children?.()}

  {#snippet footer()}
    <div class="flex w-full">
      <Button
        size="xs"
        outline={true}
        onclick={() => {
          open = false;
          onCancel && onCancel(model);
        }}
      >
        {$_t("Cancel")}
      </Button>
      <Button
        color={btnColor}
        class="ml-auto"
        onclick={() => {
          onDestroy && onDestroy(model);
          open = false;
        }}
      >
        {$_t(btnText || "Delete")}
      </Button>
    </div>
  {/snippet}
</Modal>
