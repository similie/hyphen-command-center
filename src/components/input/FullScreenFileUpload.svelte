<script lang="ts">
  import mime from "mime-types";
  import DropFileInput from "./DropFileInput.svelte";
  import { onMount, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  export let fileTypes: string[] = [];
  export let dropZone: (files: File[]) => void;

  const showUploadBox = writable(false);
  const getExtensionFromMimeType = (mimeType: string): string | false => {
    return mime.extension(mimeType);
  };
  let dragCounter = 0;
  const hasAcceptedFileType = (event: DragEvent): boolean => {
    const items = event.dataTransfer?.items;
    if (!items) {
      return false;
    }
    for (const item of items) {
      if (item.kind !== "file") {
        continue;
      }
      const ext = getExtensionFromMimeType(item.type);
      if (!ext) {
        continue;
      }
      const fileExtension = "." + ext;
      if (fileTypes.includes(fileExtension)) {
        return true;
      }
    }
    return false;
  };
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault();
    if (!hasAcceptedFileType(event)) {
      return showUploadBox.set(false);
    }
    dragCounter++;
    showUploadBox.set(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    dragCounter--;
    if (dragCounter !== 0) {
      return;
    }
    showUploadBox.set(false);
  };

  onMount(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
  });

  onDestroy(() => {
    window.removeEventListener("dragover", handleDragOver);
    window.removeEventListener("dragenter", handleDragEnter);
    window.removeEventListener("dragleave", handleDragLeave);
  });

  const dropHandle = (files: File[]) => {
    dragCounter = 0;
    showUploadBox.set(false);
    dropZone(files);
  };
</script>

{#if $showUploadBox}
  <DropFileInput
    {fileTypes}
    onDrop={dropHandle}
    defaultClass="fixed  inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 border-gray-900  border-8"
  />
{/if}
