<script lang="ts">
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import { _t, DeviceModel } from "$lib";
  import { Card, Heading, Skeleton } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { FleetHealth, FleetProfile, WeeklyPayloadChart } from "./charts";
  const api = new DeviceModel();
  let statistics = $state<any>({});
  const pullStatistics = async () => {
    // Placeholder for future statistics fetching logic
    try {
      // Simulate fetching statistics

      statistics = await api.pullStatistics();
      console.log("Fetching device statistics...", statistics);
      // You can replace this with actual API calls
    } catch (error) {
      console.error("Error fetching device statistics:", error);
    }
  };
  onMount(pullStatistics);
</script>

<BodyContainer innerClass="space-y-2 mb-6">
  <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
    <Card class="p-3 dark:bg-gray-950">
      <!-- text-primary-600 dark:text-primary-400-->
      <Heading class="text-center mb-2" tag="h5">{$_t("Total Devices")}</Heading
      >
      {#if statistics && statistics.totalDevices !== undefined}
        <Heading class="text-center text-6xl font-bold ">
          {statistics.totalDevices}
        </Heading>
      {:else}
        <Skeleton />
      {/if}
    </Card>
    <Card class="p-3 dark:bg-gray-950 ">
      <Heading class="text-center mb-2 " tag="h5"
        >{$_t("Online Devices")}</Heading
      >
      {#if statistics && statistics.onlineDevices !== undefined}
        <Heading class="text-center text-6xl font-bold ">
          {statistics.onlineDevices}
        </Heading>
      {:else}
        <Skeleton />
      {/if}
    </Card>
    <Card class="p-3 dark:bg-gray-950 ">
      <!-- text-orange-600 dark:text-yellow-500-->
      <Heading class="text-center mb-2  " tag="h5"
        >{$_t("Offline Devices")}</Heading
      >
      {#if statistics && statistics.offlineDevices !== undefined}
        <Heading class="text-center text-6xl font-bold   ">
          {statistics.offlineDevices}
        </Heading>
      {:else}
        <Skeleton />
      {/if}
    </Card>
  </div>
  <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
    <Card class="p-3 dark:bg-gray-950 max-w-full">
      <Heading class="text-center mb-2" tag="h5">{$_t("Fleet Health")}</Heading>
      {#if statistics && statistics.totalDevices !== undefined}
        <FleetHealth {statistics} />
      {:else}
        <Skeleton />
      {/if}
    </Card>
    <Card class="p-3 dark:bg-gray-950  max-w-full">
      <Heading class="text-center mb-2" tag="h5">{$_t("Fleet Profile")}</Heading
      >
      {#if statistics && statistics.deviceTypeCount !== undefined}
        <FleetProfile {statistics} />
      {:else}
        <Skeleton />
      {/if}
    </Card>
  </div>
  <div class="w-full grid grid-cols-1 justify-center">
    <Card class=" max-w-full p-3 dark:bg-gray-950 ">
      <Heading class="text-center mb-2" tag="h5"
        >{$_t("Weekly Payload Data")}</Heading
      >
      {#if statistics && statistics.deviceWeeklyCounts !== undefined}
        <WeeklyPayloadChart {statistics} />
      {:else}
        <Skeleton />
      {/if}
    </Card>
  </div>
</BodyContainer>
