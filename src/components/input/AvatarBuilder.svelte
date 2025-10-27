<script lang="ts">
  import ImageCropperModal from "$components/content/modals/ImageCropperModal.svelte";
  import {
    appFileBase,
    UserRoles,
    type ApplicationDocumentModel,
    type UUID,
  } from "$lib";
  import { Avatar, Button } from "flowbite-svelte";
  import { TrashBinOutline, UserAddOutline } from "flowbite-svelte-icons";
  let imageCropOpen: boolean = $state(false);
  let fileUrl = $state("");
  let {
    avatar = $bindable(),
    disabled = $bindable(false),
    token = "",
    aspect = 1,
    noShowAvatar = false,
    size = "xs",
    buttonColor = "alternative",
    onavatar,
    role = UserRoles.GUEST,
    square = false,
    border = false,
  } = $props<{
    square?: boolean;
    border?: boolean;
    open?: boolean;
    avatar?: UUID | undefined;
    disabled?: boolean;
    token?: string;
    aspect?: number;
    noShowAvatar?: boolean;
    buttonColor?:
      | "red"
      | "yellow"
      | "green"
      | "purple"
      | "blue"
      | "light"
      | "dark"
      | "primary"
      | "alternative"
      | undefined;
    size?: "md" | "xs" | "sm" | "lg" | "xl" | undefined;
    onavatar?: (doc: UUID | null) => void;
    role?: UserRoles;
  }>();

  const setAvatar = (doc: ApplicationDocumentModel) => {
    avatar = doc.uid;
    imageCropOpen = false;
    fileUrl = "";
    onavatar && onavatar(avatar);
  };

  const removeAvatar = () => {
    avatar = undefined;
    onavatar && onavatar(null);
  };

  $effect(() => {
    if (avatar) {
      fileUrl = appFileBase(avatar, { size: "md", token });
    } else {
      fileUrl = "";
    }
  });
</script>

{#if avatar && !noShowAvatar}
  <Avatar
    class={square ? "rounded-none  " : "mb-2"}
    {border}
    cornerStyle={square ? "rounded" : undefined}
    src={appFileBase(avatar, { size: "md", token })}
    size="lg"
  />
  <!-- {#if !disabled} -->
  <Button
    type="button"
    {disabled}
    color={buttonColor}
    size="xs"
    onclick={removeAvatar}
  >
    <TrashBinOutline size="xs" />
  </Button>
  <!-- {/if} -->
{:else}
  <Button
    {disabled}
    color={buttonColor}
    {size}
    type="button"
    onclick={() => (imageCropOpen = true)}
  >
    <UserAddOutline size="xs" />
  </Button>
{/if}
{#if !disabled}
  <ImageCropperModal
    {token}
    {fileUrl}
    {aspect}
    document={setAvatar}
    {role}
    bind:open={imageCropOpen}
  />
{/if}
