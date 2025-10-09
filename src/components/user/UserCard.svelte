<script lang="ts">
  import { UserModal } from "$components";
  import {
    ModelActionsDispatcher,
    type ModelChangeType,
    type UserModel,
    UserRoles,
    _t,
    siteUser,
  } from "$lib";
  import { Card, Dropdown, DropdownItem } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";
  import UserAvatar from "./UserAvatar.svelte";
  export let user: UserModel;
  let open = false;
  let destroyOpen = false;
  const dispatch = new ModelActionsDispatcher<UserModel>();
  const onModelChange = (event: CustomEvent<ModelChangeType<UserModel>>) => {
    open = false;
    dispatch.changeModel(event.detail.action, event.detail.model);
  };
</script>

<UserModal
  bind:deleteModal={destroyOpen}
  on:modelChange={onModelChange}
  bind:open
  model={user}
/>
<Card padding="md">
  {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
    <div class="flex justify-end">
      <DotsHorizontalOutline />
      <Dropdown class="w-36">
        <DropdownItem
          onclick={() => {
            open = true;
          }}>{$_t("Edit")}</DropdownItem
        >
        <DropdownItem
          onclick={() => {
            destroyOpen = true;
          }}>{$_t("Delete")}</DropdownItem
        >
      </Dropdown>
    </div>
  {/if}
  <div class="flex flex-col items-center pb-4 mx-auto w-full">
    <UserAvatar avatar={user.avatar} size="lg" />

    <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
      {$_t(user.name)}
    </h5>
    <div
      class="text-sm text-gray-500 dark:text-gray-400 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center cursor-pointer"
    >
      {user.email || ""}
    </div>
  </div>
</Card>
