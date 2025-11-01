<script lang="ts">
  import {
    ApplicationDocumentApi,
    siteUser,
    _t,
    type ApplicationDocumentModel,
    type UUID,
    isUUID,
  } from "$lib";

  import DropFileInput from "./DropFileInput.svelte";
  import { DocumentsViewTable, Toast } from "$components";
  import { onMount } from "svelte";
  import { Button, P, Spinner } from "flowbite-svelte";
  import { TrashBinOutline } from "flowbite-svelte-icons";
  let {
    value = $bindable(),
    edit = true,
    multiple = false,
    accept = "*",
    required = false,
    onchange,
    id,
    name,
    color,
    maxSize,
  } = $props<{
    value: string;
    edit?: boolean;
    multiple?: boolean;
    accept?: string;
    required?: boolean;
    onchange?: (value: string) => void;
    id?: string;
    name?: string;
    color?: string;
    maxSize?: number;
  }>();
  const api = new ApplicationDocumentApi();
  let uploading = $state(false);
  let documents = $state<ApplicationDocumentModel[]>([]);
  const MEGA_BYTE = 1024 * 1024;

  const resetUpload = async () => {
    uploading = true;
    documents = [];
    await Promise.resolve();
    setTimeout(() => {
      uploading = false;
    }, 100);
  };

  const fileFiles = async (documentUid: UUID[]) => {
    try {
      if (!documentUid.length) {
        return;
      }
      uploading = true;
      documents = await api.findFiles(documentUid);
    } catch (e) {
      console.error("Failed to file the existing files", e);
      documents = [];
    } finally {
      uploading = false;
    }
  };

  const removeDocs = async () => {
    try {
      uploading = true;
      await api.destroyMany(docIdsFromValue());
      value = "";
      documents = [];
      onchange && onchange(value);
    } catch (e) {
      console.error("Error deleting documents:", e);
    } finally {
      uploading = false;
    }
  };

  const setValue = (docs: ApplicationDocumentModel[]) => {
    value = docs.map((doc) => doc.uid).join(",");
    onchange && onchange(value);
  };

  const checkUploadMax = (fileList: File[]) => {
    if (maxSize === undefined && maxSize <= 0) {
      return false;
    }
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    return totalSize > maxSize * MEGA_BYTE;
  };

  const onDrop = async (fileList: File[]) => {
    try {
      if (checkUploadMax(fileList)) {
        Toast.error("File size exceeds the maximum limit");
        return resetUpload();
      }
      uploading = true;
      const newFiles = await api.upload(fileList, undefined, $siteUser?.role);
      if (newFiles && typeof newFiles === "object" && "error" in newFiles) {
        throw new Error(newFiles.error);
      }
      setValue(newFiles as ApplicationDocumentModel[]);
      documents = newFiles;
      uploading = false;
    } catch (e) {
      console.error("Error uploading files:", e);
      Toast.error("An error occurred while uploading your file");
      uploading = false;
    }
  };

  const docIdsFromValue = () => {
    if (!value) {
      return [];
    }
    const docIds = value.split(",").map((uid: string) => uid.trim());
    return docIds.filter((uid: UUID) => isUUID(uid));
  };

  const setFiles = () => {
    if (!value) {
      return;
    }
    fileFiles(docIdsFromValue());
  };

  onMount(setFiles);
</script>

{#if uploading}
  <P class="text-center">{$_t("Processing files...")} <Spinner /></P>
{:else if documents.length}
  <DocumentsViewTable {documents} />
  {#if edit}
    <Button class="mt-2" color="rose" onclick={removeDocs}
      ><TrashBinOutline /> {$_t("Remove")}</Button
    >
  {/if}
{:else if !edit}
  <P class="text-center">{$_t("No files uploaded")}</P>
{:else if !uploading}
  <DropFileInput
    {color}
    {multiple}
    fileTypes={(accept || "").split(",")}
    {onDrop}
  />
  {#if maxSize && maxSize > 0}
    <P>
      <small>
        {$_t("Maximum total file size")}: {maxSize}
        {$_t("MB")}</small
      >
    </P>
  {/if}
{/if}
<input type="hidden" bind:value {id} {required} {name} />
