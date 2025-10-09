<script lang="ts">
  import { _t, UserRolesStringsNames, type UserModel } from "$lib";
  import { P, A } from "flowbite-svelte";
  import UserAvatar from "./UserAvatar.svelte";
  import { ViewBioButton } from "$components/models";
  import UserRegistrationForm from "./UserRegistrationForm.svelte";
  let { user } = $props<{ user: UserModel }>();
  let openRegistration = $state(false);
</script>

<!-- <Card> -->
<div class="flex flex-col items-center">
  <div class="mb-4">
    <UserAvatar avatar={user.avatar} size="lg" />
  </div>
  <P class="text-lg font-semibold mb-2">{user.name}</P>
  <P>{user.username}</P>
  <A href={`mailto:${user.email}`} class="text-gray-600 mb-2">{user.email}</A>
  <P>
    {$_t("Role")}: {UserRolesStringsNames[
      user.role as keyof typeof UserRolesStringsNames
    ]}
  </P>
  {#if user.bio}
    <ViewBioButton {user} link="View Bio" />
  {/if}
  <P>
    {$_t("Joined")}: {new Date(user.created_at).toLocaleDateString()}
  </P>

  {#if user.applicationComplete}
    <UserRegistrationForm {user} bind:open={openRegistration} />

    <A onclick={() => (openRegistration = true)}>{$_t("View Registration")}</A>
  {/if}
</div>
<!-- </Card> -->
