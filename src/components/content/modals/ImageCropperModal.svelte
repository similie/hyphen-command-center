<script lang="ts">
  import { DropFileInput, Toast, ImageCrop } from "$components";
  import { Modal, P, Spinner } from "flowbite-svelte";
  import { onMount } from "svelte";
  import {
    _t,
    ApplicationDocumentApi,
    UserRoles,
    type ApplicationDocumentModel,
  } from "$lib";

  let {
    open = $bindable(),
    document,
    title = "Image Cropper",
    fileUrl = $bindable(""),
    token,
    aspect,
    role,
  } = $props<{
    open: boolean;
    title?: string;
    fileUrl: string;
    token?: string;
    aspect?: number;
    document: (doc: ApplicationDocumentModel) => void;
    role?: UserRoles;
  }>();

  const api = new ApplicationDocumentApi();

  let filename: string = $state("");
  let uploading = $state(false);
  const fileTypes = [
    "image/jpeg", // For .jpeg and .jpg files
    "image/png", // For .png files
    "image/gif", // For .gif files
    "image/bmp", // For .bmp files
    "image/webp", // For .webp files
    "image/tiff", // For .tiff and .tif files
    "image/svg+xml", // For .svg files
  ];

  const crop = async (file: File) => {
    // event.preventDefault();
    // const file = event.detail;
    uploading = true;
    try {
      const newFiles = await api.upload([file], token, role);
      if (newFiles && "error" in newFiles) {
        return Toast.error(
          "An error uploading your file occurred " + newFiles.error,
        );
      }
      document(newFiles[0]);
    } catch (e) {
      console.error(e);
    } finally {
      uploading = false;
    }
  };
  const onDrop = (fileList: File[]) => {
    const file = fileList[0];
    fileUrl = URL.createObjectURL(file);
    filename = file.name;
  };

  onMount(async () => {});
</script>

<Modal size="xs" form {title} bind:open>
  {#if !uploading}
    <P>{$_t("Select an image to crop")}</P>
  {/if}
  <div class="flex items-center justify-center">
    {#if uploading}
      <P>{$_t("Uploading")} <Spinner /></P>
    {:else}
      <ImageCrop {aspect} {filename} {fileUrl} {crop} />
    {/if}
  </div>
  {#if !fileUrl}
    <DropFileInput multiple={false} {fileTypes} {onDrop} />
  {/if}
</Modal>
