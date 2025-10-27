<script lang="ts">
  import UserAvatar from "$components/user/UserAvatar.svelte";
  import { _t, type IDevice, type ISensor, type ISensorWithKey } from "$lib";
  import { A, Listgroup, ListgroupItem, P } from "flowbite-svelte";
  import { onMount } from "svelte";

  let { sensors, appliedSensors, onAdd } = $props<{
    sensors: ISensor[];
    onAdd: (sensor: ISensor) => void;
    appliedSensors: ISensorWithKey[];
    device?: IDevice;
  }>();
  let counts = $state<Record<string, number>>({});
  let storedSensors = $state<Record<string, ISensor>>({});
  let availableSensors = $state<ISensor[]>([]);

  const runCount = () => {
    let countsLocal: Record<string, number> = {};
    for (const sensor of sensors) {
      countsLocal[sensor.identity] = 0;
      storedSensors[sensor.identity] = sensor;
    }
    for (const appliedSensor of appliedSensors) {
      countsLocal[appliedSensor.identity] =
        (countsLocal[appliedSensor.identity] || 0) + 1;
    }
    counts = countsLocal;
  };
  onMount(() => {
    runCount();
  });

  $effect(() => {
    // runCount();
    availableSensors = sensors.filter(
      (sensor: ISensor) => (counts[sensor.identity] || 0) < sensor.max,
    );
  });

  $effect(() => {
    runCount();
  });
</script>

{#if !availableSensors.length}
  <P class="text-center">{$_t("No available sensors to add.")}</P>
{:else}
  <Listgroup>
    {#each availableSensors as sensor}
      <ListgroupItem>
        <div class="flex items-center space-x-1">
          <UserAvatar size="xs" avatar={sensor.avatar} />
          <A size="xs" class="ml-auto" onclick={() => onAdd(sensor)}>
            <strong>{sensor.name}</strong> ({sensor.identity})
          </A>
        </div>
      </ListgroupItem>
    {/each}
  </Listgroup>
{/if}
