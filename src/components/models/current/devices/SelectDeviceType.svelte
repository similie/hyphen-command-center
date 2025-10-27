<script lang="ts">
  import UserAvatar from "$components/user/UserAvatar.svelte";
  import { _t, DeviceProfile, type IDeviceProfile, type UUID } from "$lib";
  import { Avatar, Select } from "flowbite-svelte";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    required,
    disabled,
    onchange,
    viewOnly = false,
  } = $props<{
    value?: UUID;
    required?: boolean;
    disabled?: boolean;
    viewOnly?: boolean;
    onchange?: (value: UUID) => void;
  }>();
  const api = new DeviceProfile();
  let selectedDevices = $state<Record<string, IDeviceProfile>>({});
  let deviceProfiles = $state<
    {
      value: UUID;
      name: string;
      avatar?: UUID;
    }[]
  >([]);
  const pullProfiles = async () => {
    const profiles = await api.find().sort({ name: "ASC" }).fetch();
    deviceProfiles = profiles.map((profile) => ({
      value: profile.id! as UUID,
      name: profile.name,
      avatar: profile.avatar,
    }));
    selectedDevices = profiles.reduce(
      (acc, profile) => {
        acc[profile.id! as UUID] = profile;
        return acc;
      },
      {} as Record<string, IDeviceProfile>,
    );
  };
  onMount(pullProfiles);
</script>

{#if !viewOnly}
  <Select
    {required}
    {disabled}
    onchange={() => onchange?.(value)}
    bind:value
    items={deviceProfiles}
  />
{:else}
  <div class="flex space-x-2 items-center">
    {#if value && selectedDevices[value]}
      <UserAvatar
        size="xs"
        type="device"
        avatar={selectedDevices[value].avatar}
      />
      <span>{selectedDevices[value].name}</span>
    {:else}
      <span>{$_t("No Device Profile Selected")}</span>
    {/if}
  </div>
{/if}
