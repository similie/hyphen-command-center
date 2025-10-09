<script lang="ts">
  import { _t, fileListToFile } from "$lib";
  import mime from "mime-types";
  import DropzoneLocal from "./DropzoneLocal.svelte";
  import { onDestroy } from "svelte";
  let {
    multiple = true,
    size = "sm",
    fileTypes = $bindable(),
    onDrop,
    onPreDrop,
    color,
  } = $props<{
    multiple?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    fileTypes?: string[];
    onDrop: (files: File[]) => void | Promise<void>;
    onPreDrop?: (event: Event) => void | Promise<void>;
    defaultClass?: string;
    color?: string;
  }>();
  // export let multiple = true;
  let fileValues: FileList | null = $state(null);
  let value: string[] = $state([]);

  const includesFileType = (type: string) => {
    if (!fileTypes.length) {
      return true;
    }
    const extension = mime.extension(type);
    // reconsider
    if (!extension) {
      return false;
    }
    return fileTypes
      .map((f: string) => {
        const split = f.split("/");
        const type = split[split.length - 1];
        return type.replace(".", "").replace("+xml", "");
      })
      .includes(extension);
  };

  const dropHandle = (event: DragEvent) => {
    event.preventDefault();
    value = [];
    if (!event.dataTransfer) {
      return;
    }

    const sendValues: File[] = [];
    // console.log("Drop event", event.dataTransfer.files);
    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach((item) => {
        if (item.kind === "file" && includesFileType(item.type)) {
          const file = item.getAsFile();
          if (!file) {
            return;
          }
          value.push(file.name);
          value = value;
          sendValues.push(file);
        }
      });
    } else {
      const files = [...event.dataTransfer.files];
      for (const file of files) {
        if (!includesFileType(file.type)) {
          continue;
        }
        sendValues.push(file);
      }
    }

    if (!sendValues.length) {
      return;
    }
    onDrop(sendValues);
  };

  const handleChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;

    onPreDrop && onPreDrop(event);
    const files = target.files;
    const sendValues: File[] = [];
    if (!files) {
      return onDrop(sendValues);
    }
    const localValues: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!includesFileType(file.type)) {
        continue;
      }
      localValues.push(file.name);
      const newFile = await fileListToFile(file);
      sendValues.push(newFile);
    }
    value = localValues;
    onDrop(sendValues);
    target.value = "";
  };

  const showFiles = (files: string[]) => {
    if (files.length === 1) return files[0];
    let concat = "";
    files.map((file) => {
      concat += file;
      concat += ",";
      concat += " ";
    });

    if (concat.length > 40) concat = concat.slice(0, 40);
    concat += "...";
    return concat;
  };

  onDestroy(() => {
    fileValues = null;
    value = [];
  });
</script>

<DropzoneLocal
  {multiple}
  id="dropzone"
  bind:files={fileValues}
  accept={fileTypes.join(", ")}
  ondrop={dropHandle}
  ondragover={(event) => {
    event.preventDefault();
  }}
  {color}
  onchange={handleChange}
>
  <svg
    aria-hidden="true"
    class="mb-3 w-10 h-10 {color ? color : 'text-primary-600'}  "
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ><path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    /></svg
  >
  {#if value.length === 0}
    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
      <span class="font-semibold text-primary-600"
        >{$_t("Click to upload")}</span
      >
      {$_t("or drag and drop")}
    </p>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {fileTypes.join(", ").toUpperCase()}
    </p>
  {:else}
    <p>{showFiles(value)}</p>
  {/if}
</DropzoneLocal>
