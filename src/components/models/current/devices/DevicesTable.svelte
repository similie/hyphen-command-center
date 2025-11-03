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
    Spinner,
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
  let loading = $state(true);
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
    loading = true;
    dApi
      .find(getQuery())
      .sort({ lastTouched: { direction: "DESC", nulls: "LAST" }, name: "ASC" })
      .limit(limit)
      .skip((skip - 1) * limit)
      .fetch()
      .then((fetchedDevices: IDevice[]) => {
        // Handle the retrieved devices
        devices = fetchedDevices;
        loading = false;
      })
      .catch(console.error)
      .finally(() => {
        loading = false;
      });
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

  const tableRows = ["Identity", "Name", "Status", "Last Heard", " "];
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
    {#each tableRows as row}
      <TableHeadCell>{$_t(row)}</TableHeadCell>
    {/each}
  </TableHead>

  <TableBody>
    {#if loading}
      <TableBodyRow>
        <TableBodyCell colspan={tableRows.length}>
          <P class="text-center w-full"
            >{$_t("Loading devices...")} <Spinner /></P
          >
        </TableBodyCell>
      </TableBodyRow>
    {:else if !devices.length}
      <TableBodyRow>
        <TableBodyCell colspan={tableRows.length}>
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
