<script lang="ts">
  import {
    type IDevice,
    type ISensor,
    type ISensorWithKey,
    DeviceModel,
    LocalSocket,
    SensorModel,
    _t,
    appFileBase,
  } from "$lib";
  import { A, Heading, P, Card, Button, Popover, Label } from "flowbite-svelte";
  import {
    InfoCircleOutline,
    RefreshOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import { onDestroy, onMount } from "svelte";
  import AvailableSensors from "./AvailableSensors.svelte";
  import { Toast } from "$components/toasts";
  const dApi = new DeviceModel();
  const sApi = new SensorModel();
  let { device } = $props<{ device: IDevice }>();
  let deviceSensors = $state<ISensorWithKey[]>([]);
  let sensors = $state<ISensor[]>([]);
  let loading = $state(false);
  let refreshing = $state(false);
  const pullSensors = async () => {
    try {
      loading = true;
      const { sensors: foundSensors } = await dApi.sensors(device);
      deviceSensors = foundSensors;
      sensors = await sApi.find().sort({ createdAt: "ASC" }).fetch();
    } catch (e) {
      console.error("Error fetching device sensors:", e);
    } finally {
      loading = false;
    }
  };

  const refreshSensors = async () => {
    if (refreshing) {
      return;
    }
    refreshing = true;
    dApi
      .refreshSensors(device)
      .then(async () => {
        Toast.success("Device sensors refresh initiated.");
      })
      .catch((e) => {
        console.error("Error refreshing device sensors:", e);
      });
  };

  const processSync = async () => {
    try {
      const { sensors: foundSensors } = await dApi.sensors(device);
      deviceSensors = foundSensors;
    } catch (e) {
      console.error("Error processing sensor sync:", e);
    } finally {
      refreshing = false;
    }
  };

  const onAdd = (sensor: ISensor) => {
    dApi
      .addSensor(device, sensor.identity)
      .then(() => {
        pullSensors();
      })
      .catch((e) => {
        console.error("Error adding sensor:", e);
        Toast.error("Failed to add sensor.");
      });
  };
  const onRemove = (sensor: ISensorWithKey) => {
    dApi
      .removeSensor(device, sensor.relation.key)
      .then(() => {
        deviceSensors = deviceSensors.filter(
          (s) => s.identity !== sensor.identity,
        );
      })
      .catch((e) => {
        console.error("Error adding sensor:", e);
        Toast.error("Failed to remove sensor.");
      });
  };

  let socketMessage = $derived(`device/${device.identity}/sensors/sync`);
  onMount(() => {
    pullSensors();
    LocalSocket.instance.listen(socketMessage, processSync);
  });

  onDestroy(() => {
    LocalSocket.instance.forget(socketMessage, processSync);
  });
</script>

<div class="flex flex-col space-y-2 w-full">
  <div class="flex w-full items-center">
    <Heading tag="h3">{$_t("Device Sensors")}</Heading>
    <A disabled={refreshing} onclick={refreshSensors} class="ml-auto"
      ><RefreshOutline class={refreshing ? "animate-spin" : ""} />
      {$_t("Refresh")}</A
    >
  </div>
  <P class="text-sm"
    >{$_t("Device Sensors Component for device")}: {device.name}
    <A
      ><InfoCircleOutline />
      <Popover>{$_t("Feature only available to HyphenOS devices")}</Popover>
    </A></P
  >
  <div class="grid grid-cols-1 gap-2 w-full md:grid-cols-2 lg:grid-cols-4">
    {#each deviceSensors as sensor}
      <Card
        img={sensor.avatar ? appFileBase(sensor.avatar, "md") : undefined}
        imgClass="object-cover h-32"
        class="max-w-xs relative"
      >
        <div class="absolute top-2 right-2 rounded-full p-1">
          <Button size="xs" color="rose" pill onclick={() => onRemove(sensor)}>
            <TrashBinOutline size="xs" />
          </Button>
        </div>

        <div class="p-2 flex flex-col h-38 text-overflow-hidden">
          <Heading class="text-center" tag="h6">{sensor.name}</Heading>
          <P class="text-center" size="sm">{sensor.description}</P>
          <P size="xs" class="mt-auto"
            ><span class="font-bold">{$_t("Key")}:</span>
            {sensor.relation.key}</P
          >
        </div>
      </Card>
    {/each}
  </div>
  <div class="w-[22em]">
    <Label>{$_t("Available Sensors")}</Label>
    <AvailableSensors
      {onAdd}
      {sensors}
      appliedSensors={deviceSensors}
      {device}
    />
  </div>
</div>
