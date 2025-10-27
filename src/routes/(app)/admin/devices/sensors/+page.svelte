<script lang="ts">
  import { DeviceFirmwareEditor, UserAvatar } from "$components";
  import DeviceSensorEditor from "$components/models/current/devices/DeviceSensorEditor.svelte";
  import { BodyContainer } from "$layouts";
  import { onEvent, _t, SensorModel, type ISensor } from "$lib";
  import { Accordion, AccordionItem, Heading, P } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  const api = new SensorModel();
  let sensors = $state<ISensor[]>([]);
  let loading = $state(true);

  const findDeviceProfiles = async () => {
    try {
      loading = true;
      sensors = await api.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching device profiles:", e);
    } finally {
      loading = false;
    }
  };

  onMount(findDeviceProfiles);

  onDestroy(
    onEvent<ISensor>("sensor:created", (d: ISensor) => {
      const index = sensors.findIndex((x) => x.id === d.id);
      if (index !== -1) {
        sensors[index] = d;
        return;
      }
      sensors.push(d);
    }),
  );

  const onDelete = (val: ISensor) => {
    sensors = sensors.filter((f) => f.id !== val.id);
  };
</script>

<BodyContainer>
  {#if loading}
    <P class="text-center">{$_t("Loading Device Profiles...")}</P>
  {:else if sensors.length === 0}
    <P class="text-center">{$_t("No Device Profiles found")}.</P>
  {:else}
    <Accordion flush={true} class="w-full">
      {#each sensors as _sensor, index}
        <AccordionItem>
          {#snippet header()}
            <div class="flex space-x-2 items-center">
              <UserAvatar size="sm" type="device" avatar={_sensor.avatar} />
              <Heading tag="h5">{_sensor.name}</Heading>
            </div>
          {/snippet}
          <DeviceSensorEditor bind:value={sensors[index]} {onDelete} />
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
</BodyContainer>
