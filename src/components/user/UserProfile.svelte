<script lang="ts">
  import UserAvatar from "./UserAvatar.svelte";
  import { siteUser } from "$lib";
  import PersonalProfile from "./PersonalProfile.svelte";
  import { Dropdown, DropdownItem } from "flowbite-svelte";
  import SignOutButton from "./SignOutButton.svelte";
  let showProfile = false;
  let showDropdown = false;
  let timeoutInterval: ReturnType<typeof setTimeout>;
  const handleLeave = () => {
    timeoutInterval = setTimeout(() => {
      showDropdown = false;
    }, 500);
  };
  const handleHover = () => {
    clearTimeout(timeoutInterval);
    showDropdown = true;
  };
</script>

{#if $siteUser}
  <PersonalProfile bind:open={showProfile} />
  <button
    onclick={() => (showProfile = true)}
    onmouseenter={handleHover}
    onmouseleave={handleLeave}
  >
    <UserAvatar
      aClass="hover:ring-primary-400 hover:dark:ring-primary-300"
      border={true}
      avatar={$siteUser.avatar}
      size="md"
    />
  </button>
{/if}
<Dropdown bind:isOpen={showDropdown}>
  <DropdownItem
    onmouseenter={handleHover}
    onmouseleave={handleLeave}
    class="w-32 rounded-lg p-1"
  >
    <SignOutButton size="xs" />
  </DropdownItem>
</Dropdown>
