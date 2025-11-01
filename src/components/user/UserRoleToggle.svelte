<script lang="ts">
  import { page } from "$app/state";
  import { DestroyModelModal } from "$components";
  import {
    isAdminUser,
    UserRoles,
    UserRolesStrings,
    _t,
    type UserModel,
  } from "$lib";
  import { IconCrown, IconUser } from "@tabler/icons-svelte";
  import { A, Modal, Button, P } from "flowbite-svelte";
  import { BanOutline } from "flowbite-svelte-icons";

  let {
    user,
    changeAction,
    disabled = false,
  } = $props<{
    user: UserModel;
    changeAction: (user: UserModel, key: keyof UserModel) => void;
    disabled?: boolean;
  }>();
  let open = $state(false);
  let updatedUser = $state<UserModel>(user);
  let ensureModel = $state(false);
  let roleChangeBody = $state("");
  let btnText = $state($_t("Change Role"));
  let changeRole = $state(-1);
  const runChange = () => {
    if (changeRole === -1) {
      console.log("No role change requested for user:", user.id);
      return;
    }
    updatedUser.role = changeRole;
    open = false;
    changeAction && changeAction(updatedUser, "role");
  };
  const openChangeModal = () => {
    ensureModel = true;
  };
  const demote = () => {
    roleChangeBody = $_t("Are you sure you want to demote this user?");
    btnText = $_t("Demote User");
    changeRole = UserRoles.USER;
    openChangeModal();
  };
  const ban = () => {
    roleChangeBody = $_t("Are you sure you want to ban this user?");
    btnText = $_t("Ban User");
    changeRole = UserRoles.BLOCKED;
    openChangeModal();
  };

  const promote = () => {
    roleChangeBody = $_t("Are you sure you want to promote this user?");

    if (user.role === UserRoles.BLOCKED) {
      changeRole = UserRoles.USER;
    } else {
      changeRole = UserRoles.ADMIN;
    }

    btnText = $_t("Promote User");
    openChangeModal();
  };
</script>

<Modal bind:open title={$_t(`Change Role for ${user.name}`)} size="md">
  <p>{$_t("Click to view or change the user role.")}</p>
  <div class="flex-col flex gap-2 mt-4 mx-auto">
    <Button color="rose" onclick={ban}>
      {$_t("Ban User")}
      <BanOutline />
    </Button>

    {#if isAdminUser(user)}
      <Button color="alternative" onclick={demote}>
        {$_t("Demote User")}
        <IconUser />
      </Button>
    {:else}
      <Button color="alternative" onclick={promote}>
        {$_t("Promote User")}
        <IconCrown />
      </Button>
    {/if}
  </div>
</Modal>

<DestroyModelModal
  bind:open={ensureModel}
  title={$_t("Confirm Role Change")}
  body={roleChangeBody}
  model={user}
  {btnText}
  onDestroy={runChange}
  onCancel={() => {
    console.log("Role change cancelled for user:", user.id);
    changeRole = -1;
  }}
/>

{#if page.data.session.user.uid === user.uid || disabled}
  <P
    ><span class="text-gray-500"
      >{UserRolesStrings[
        UserRoles[updatedUser.role] as keyof typeof UserRolesStrings
      ] || "Unknown Role"}</span
    ></P
  >
{:else}
  <A
    onclick={() => {
      open = true;
    }}
  >
    {UserRolesStrings[
      UserRoles[updatedUser.role] as keyof typeof UserRolesStrings
    ] || "Unknown Role"}</A
  >
{/if}
