<script lang="ts">
  import { ModelActions, UserApi, type UserModel, _t } from "$lib";
  import { TableBodyCell, TableBodyRow, A, Button } from "flowbite-svelte";
  import UserAvatar from "../UserAvatar.svelte";
  import UserRoleToggle from "../UserRoleToggle.svelte";
  import { Toast } from "$components/toasts";
  import UserModal from "./UserModal.svelte";
  let open = $state(false);
  const api = new UserApi();
  let { user, onremove } = $props<{
    user: UserModel;
    onremove: (user: UserModel) => void;
  }>();
  const changeAction = (user: UserModel, key: keyof UserModel) => {
    console.log("Change action for user:", user[key], key);
    api
      .update({ [key]: user[key] }, { uid: user.uid })
      .then(() => {
        Toast.success(`User ${user.name} updated successfully.`);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        Toast.error(`User ${user.name} failed to update.`);
      });
  };

  const oninput = (action: ModelActions, user: UserModel) => {
    if (action === ModelActions.DELETE) {
      // Handle delete action
      Toast.success(`User ${user.name} deleted successfully.`);
      open = false;
      return onremove(user);
    }
    Toast.success(`User ${user.name} updated successfully.`);
  };
</script>

<UserModal bind:model={user} bind:open {oninput} />
<TableBodyRow>
  <TableBodyCell>
    <UserAvatar avatar={user.avatar} size="md" />
  </TableBodyCell>
  <TableBodyCell>{user.name}</TableBodyCell>
  <TableBodyCell>{user.username}</TableBodyCell>
  <TableBodyCell
    ><A href={`mailto:${user.email}`}>{user.email}</A></TableBodyCell
  >
  <TableBodyCell
    ><UserRoleToggle disabled {user} {changeAction} /></TableBodyCell
  >
  <TableBodyCell
    ><Button type="button" onclick={() => (open = true)}>{$_t("Edit")}</Button
    ></TableBodyCell
  >
</TableBodyRow>
