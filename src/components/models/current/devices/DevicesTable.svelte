<script lang="ts">
  import {
    Debounce,
    DeviceModel,
    type FireHoseEvent,
    type IDevice,
    LocalSocket,
    type SocketMessage,
    _t,
  } from "$lib";
  import {
    Heading,
    P,
    Search,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import DevicesTableRow from "./DevicesTableRow.svelte";
  import PaginationControls from "$components/input/PaginationControls.svelte";
  import { goto } from "$app/navigation";
  const limit = 50;
  let skip = $state(1);
  let count = $state(0);
  let search = $state("");
  let devices = $state<IDevice[]>([]);
  const dApi = new DeviceModel();
  const getQuery = () => {
    const query: { or?: any } = {};
    if (search) {
      query["or"] = [
        { name: { contains: search } },
        { notes: { contains: search } },
        { identity: { contains: search } },
      ];
      return query;
    }
    return undefined;
  };
  const fetchDevices = () => {
    // console.log("Fetching devices", skip, limit, (skip - 1) * limit);
    dApi
      .find(getQuery())
      .sort({ lastTouched: { direction: "DESC", nulls: "LAST" }, name: "ASC" })
      .limit(limit)
      .skip((skip - 1) * limit)
      .fetch()
      .then((fetchedDevices: IDevice[]) => {
        // Handle the retrieved devices
        devices = fetchedDevices;
        console.log("Retrieved devices:", devices);
      })
      .catch(console.error);
  };

  const setup = () => {
    skip = 1;
    dApi.count(getQuery()).then((countValue) => {
      count = countValue;
    });
    fetchDevices();
  };

  const devicesUpdated = (data: SocketMessage<FireHoseEvent>) => {
    if (!data || !data.device) {
      return;
    }

    const deviceUpdate = {
      ...data.device!,
    };
    const index = devices.findIndex((d) => d.id === deviceUpdate.id);
    if (index === -1) {
      return;
    }
    devices[index] = { ...devices[index], ...deviceUpdate };
    devices = [...devices];
  };

  onDestroy(() => {
    LocalSocket.instance.forget("devices", devicesUpdated);
  });

  onMount(() => {
    setup();
    LocalSocket.instance.listen("devices", devicesUpdated);
  });

  const navigateTo = (device: IDevice) => {
    goto(`/devices/${device.id}`);
  };
  const debounce = new Debounce();
  const searchChanged = debounce.bounce(() => {
    setup();
  }, 300);

  const onRemove = (device: IDevice) => {
    devices = devices.filter((d) => d.id !== device.id);
    count = Math.max(0, count - 1);
  };
</script>

<div class="w-full rounded-2xl mb-4">
  <Heading tag="h5" class="mb-2">{$_t("Total devices")}: {count}</Heading>
  <!-- Table -->
  <div class="md:max-w-1/3">
    <Search
      bind:value={search}
      size="md"
      placeholder={$_t("Search devices...")}
      oninput={searchChanged}
    />
  </div>
</div>

<Table hoverable class="w-full" shadow striped>
  <TableHead>
    <TableHeadCell>{$_t("Identity")}</TableHeadCell>
    <TableHeadCell>{$_t("Name")}</TableHeadCell>
    <TableHeadCell>{$_t("Status")}</TableHeadCell>
    <TableHeadCell>{$_t("Last Heard")}</TableHeadCell>
    <TableHeadCell>{" "}</TableHeadCell>
  </TableHead>

  <TableBody>
    {#if !devices.length}
      <TableBodyRow>
        <TableBodyCell colspan={4}>
          <P class="text-center w-full">{$_t("No devices found")}</P>
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      {#each devices as device (device.id)}
        <TableBodyRow
          onclick={() => navigateTo(device)}
          class="hover:cursor-pointer dark:border-primary-200 border-primary-700"
        >
          <DevicesTableRow {device} {onRemove} />
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</Table>
<div class="my-4"></div>
<PaginationControls
  {count}
  {limit}
  bind:currentPage={skip}
  onChange={fetchDevices}
/>
