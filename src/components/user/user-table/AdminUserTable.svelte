<script lang="ts">
  import {
    isAdminUser,
    type UserModel,
    _t,
    Debounce,
    UserApi,
    UserRoles,
  } from "$lib";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { Toast, PaginationControls, UserRoleSelect } from "$components";
  import { goto } from "$app/navigation";
  import {
    Search,
    Spinner,
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import AdminTableRow from "./AdminTableRow.svelte";

  const api = new UserApi();
  let {
    users,
    count,
    reload = $bindable(),
    limit,
  } = $props<{
    users: UserModel[];
    count: number;
    limit: number;
    reload?: () => void;
  }>();
  let userRole = $state<UserRoles>(-1);
  let elementTxt = $state("");
  let localUsers = $state<UserModel[]>(users);
  let localCount = $state<number>(count);
  let currentPage = $state<number>(1);
  let searching = $state<boolean>(false);
  const bound = new Debounce();

  const sendSearch = bound.bounce(async () => {
    try {
      searching = true;
      const search = await api.search(
        elementTxt,
        currentPage - 1,
        limit,
        userRole,
      );
      localUsers = search.users;
      localCount = search.count;
    } catch (error) {
      console.error("Error during search:", error);
      Toast.error("Search failed. Please try again.");
    }
    searching = false;
    // Implement search logic here, e.g., filter users based on searchTerm
  }, 500);

  reload = () => {
    console.log("Reloading users", users);
    localUsers = users;
    localCount = count;
    currentPage = 1;
    elementTxt = "";
  };

  onMount(() => {
    const { user } = page.data.session;
    if (!user || !isAdminUser(user)) {
      goto("/");
      return Toast.error(
        "Unauthorized access. You must be an admin to view this page.",
      );
    }
    // console.log("AdminUserTable Loaded", users, count, page.data.session);
  });
  const onremove = (user: UserModel) => {
    users = users.filter((u: UserModel) => u.uid !== user.uid);
    localUsers = users;
    localCount -= 1;
    console.log("User removed:", user);
    // Toast.success(`User ${user.name} removed successfully.`);
    // reload && reload();
  };
</script>

<div class="flex w-full space-x-2 content-center">
  <Search
    placeholder={$_t("Search Users")}
    bind:value={elementTxt}
    onkeyup={sendSearch}
    size="md"
  ></Search>
  <UserRoleSelect
    className=""
    noLabel
    oninput={sendSearch}
    bind:model={userRole}
  />
  {#if searching}
    <Spinner />
  {/if}
</div>

<Table class="mt-3" shadow striped hoverable={true} border={false}>
  <TableHead>
    <TableHeadCell>{$_t("Profile")}</TableHeadCell>
    <TableHeadCell>{$_t("Name")}</TableHeadCell>
    <TableHeadCell>{$_t("Username")}</TableHeadCell>
    <TableHeadCell>{$_t("Email")}</TableHeadCell>
    <TableHeadCell>{$_t("Role")}</TableHeadCell>
    <!-- <TableHeadCell>{$_t("QR")}</TableHeadCell> -->
    <TableHeadCell>{$_t("")}</TableHeadCell>
    <!-- <TableHeadCell>{$_t("Status")}</TableHeadCell> -->
  </TableHead>
  <TableBody>
    {#each localUsers as user (user.uid)}
      <AdminTableRow {user} {onremove} />
    {/each}
  </TableBody>
</Table>
<PaginationControls
  bind:currentPage
  {limit}
  count={localCount}
  onChange={() => sendSearch()}
/>
