<script lang="ts">
  import { DeviceProfileEditor } from "$components";
  import UserAvatar from "$components/user/UserAvatar.svelte";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import { onEvent, _t, DeviceProfile, type IDeviceProfile } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new DeviceProfile();
  let deviceProfiles = $state<IDeviceProfile[]>([]);
  let loading = $state(true);

  const findDeviceProfiles = async () => {
    try {
      loading = true;
      deviceProfiles = await api.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching device profiles:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findDeviceProfiles);

  onDestroy(
    onEvent<IDeviceProfile>("deviceprofile:created", (d: IDeviceProfile) => {
      const index = deviceProfiles.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        deviceProfiles[index] = d;
        return;
      }
      deviceProfiles.push(d);
    }),
  );

  const onDelete = (val: IDeviceProfile) => {
    deviceProfiles = deviceProfiles.filter((f) => f.id !== val.id);
  };
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Device Profiles...")}</P>
  {:else if deviceProfiles.length === 0}
    <P class="text-center">{$_t("No Device Profiles found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each deviceProfiles as _deviceProfile, index}
        <AccordionItem>
          {#snippet header()}
            <div class="flex space-x-2 items-center">
              <UserAvatar
                size="sm"
                type="device"
                avatar={_deviceProfile.avatar}
              />
              <Heading tag="h5">{_deviceProfile.name}</Heading>
            </div>
          {/snippet}
          <DeviceProfileEditor
            bind:profile={deviceProfiles[index]}
            {onDelete}
          />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
