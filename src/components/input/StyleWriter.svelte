<script lang="ts">
  import {
    TextEditor,
    ToolbarRowWrapper,
    AlignmentButtonGroup,
    CharacterCount,
    BubbleMenu,
    Divider,
    EditableButton,
    FormatButtonGroup,
    HeadingButtonGroup,
    ListButtonGroup,
    UndoRedoButtonGroup,
  } from "@flowbite-svelte-plugins/texteditor";
  import { Editor } from "@tiptap/core";
  import { _t, Debounce } from "$lib";
  import { onDestroy, onMount } from "svelte";
  let {
    value = $bindable(),
    countLimit = 0,
    minLimit = 0,
    disabled = false,
    required = false,
    onchange,
    id,
    class: className,
  } = $props<{
    value?: string;
    countLimit?: number;
    minLimit?: number;
    disabled?: boolean;
    required?: boolean;
    id?: string;
    onchange?: (value: string) => void;
    class?: string;
  }>();
  let editorInstance = $state<Editor | null>(null);
  let isEditable = $state(!disabled);
  const debounce = new Debounce();

  const content = value || "";

  function handleEditableToggle(editable: boolean) {
    isEditable = editable;
  }

  const sendValue = debounce.bounce(() => {
    onchange && onchange(value);
  }, 300);

  onMount(() => {
    editorInstance?.on("create", () => {
      editorInstance?.on("update", () => {
        // console.log("Editor content updated:", editorInstance?.getHTML());
        if (editorInstance) {
          value = editorInstance.getHTML();
          sendValue();
        }
      });
    });
  });

  onDestroy(() => {
    editorInstance?.destroy();
  });

  $effect(() => {
    if (editorInstance) {
      editorInstance.setEditable(!disabled);
    }
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/base16/google-dark.min.css"
  />
</svelte:head>
{className}
<TextEditor
  bind:editor={editorInstance}
  class=" rounded-lg shadow-md "
  editorClass="h-full min-h-[120px] max-h-[400px] overflow-y-auto  format lg:format-lg dark:format-invert focus:outline-none format-primary-600  {className
    ? className
    : 'max-w-none'}"
  {content}
  file
  {isEditable}
  floatingMenu={false}
  detailsPlaceholder={$_t("Let's add some details...")}
  contentprops={{ id: "drag-handle-editable" }}
>
  <BubbleMenu editor={editorInstance} />
  <ToolbarRowWrapper>
    <!-- <EditableButton
      editor={editorInstance}
      bind:isEditable
      onToggle={handleEditableToggle}
    /> -->
    <AlignmentButtonGroup editor={editorInstance} />
    <HeadingButtonGroup fontFamily={false} editor={editorInstance} />
    <UndoRedoButtonGroup editor={editorInstance} />
    <Divider />
    <ListButtonGroup editor={editorInstance} />
    <FormatButtonGroup
      highlight={false}
      bold={false}
      italic={false}
      strike={false}
      underline={false}
      editor={editorInstance}
      br={false}
    />
  </ToolbarRowWrapper>

  {#snippet footer()}
    {#if editorInstance && countLimit > 0}
      <CharacterCount editor={editorInstance} limit={countLimit} />
    {/if}
  {/snippet}
</TextEditor>
<div class="relative">
  <input
    {id}
    type="text"
    class="sr-only"
    bind:value
    min={minLimit}
    max={countLimit}
    {required}
  />
</div>
