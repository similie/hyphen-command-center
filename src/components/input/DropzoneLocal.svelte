<script lang="ts">
  import type { DragEventHandler, ChangeEventHandler } from "svelte/elements";
  import { dropzone } from "flowbite-svelte";
  import clsx from "clsx";
  import type { DropzoneProps } from "flowbite-svelte";
  import { getTheme } from "flowbite-svelte";

  // Destructure props using Svelte 5 runes
  let {
    children,
    files = $bindable<FileList | null>(),
    multiple = $bindable(true),
    accept = $bindable(""),
    class: className,
    onchange,
    ondragover,
    ondrop,
    ...restProps
  }: DropzoneProps = $props();

  const theme = getTheme("dropzone");
  let input: HTMLInputElement;

  function keydown(event: KeyboardEvent) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      input.click();
    }
  }

  function onClick(event: MouseEvent) {
    event.preventDefault();
    input.click();
  }

  const onDrop: DragEventHandler<HTMLButtonElement> = function (
    this: Window,
    event,
  ) {
    event.preventDefault();

    // When files are dropped, update the files binding
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      files = event.dataTransfer.files;
    }

    // Then call any custom ondrop handler
    if (ondrop) {
      ondrop.call(this, event as any);
    }
  };

  const onDragOver: DragEventHandler<HTMLButtonElement> = function (
    this: Window,
    event,
  ) {
    event.preventDefault();
    if (ondragover) ondragover.call(this, event as any);
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = function (
    this: Window,
    event,
  ) {
    if (onchange) onchange.call(this, event);
  };
</script>

<button
  class={dropzone({ class: clsx(theme, className) })}
  type="button"
  onkeydown={keydown}
  onclick={onClick}
  ondrop={onDrop}
  ondragover={onDragOver}
>
  {@render children()}
</button>

<label class="hidden">
  <input
    {...restProps}
    bind:files
    bind:this={input}
    {accept}
    {multiple}
    onchange={onChange}
    type="file"
  />
</label>
