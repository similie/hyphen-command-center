<script lang="ts">
  import { _t } from "$lib";
  import {
    Button,
    Hr,
    Input,
    Select,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";

  import { onMount } from "svelte";

  let {
    value = $bindable(),
    valid = $bindable(),
    disabled = false,
  } = $props<{
    value?: { address: number; type: string }[];
    valid?: boolean;
    disabled?: boolean;
  }>();
  let selectedAddress = $state<{ address: string }[]>([]);
  let ready = $state(false);
  /**

  * # Name,      Type,   SubType,   Offset,     Size,       Flags
nvs,          data,   nvs,       0x9000,     0x5000,
otadata,      data,   ota,       0xe000,     0x2000,
app0,         app,    ota_0,     0x10000,    0x580000,
app1,         app,    ota_1,     0x590000,   0x580000,
spiffs,       data,   spiffs,    0xB10000,   0x3E0000,
coredump,     data,   coredump,  0xF00000,   0x010000,
  */
  const selectValueItems = [
    {
      value: "bootloader.bin",
      name: "Bootloader",
      defValue: "0x1000",
    },
    {
      value: "partitions.bin",
      name: "Partition Table",
      defValue: "0x8000",
    },
    {
      value: "firmware.bin",
      name: "Application",
      defValue: "0x10000",
    },
    {
      value: "ota.bin",
      name: "OTA Data",
      defValue: "0x590000",
    },
    {
      value: "spiffs.bin",
      name: "Spiffs Data",
      defValue: "0xB10000",
    },
  ];

  $effect(() => {
    valid =
      value.length > 0 &&
      value.every((v: any) => v.data && v.address !== undefined);
  });

  const parseInputAndUpdateValue = (index: number) => {
    const input = selectedAddress[index].address;
    console.log("Address input changed:", input);
    const parsed = parseInt(input, 16);
    console.log("Parsed address input:", input, parsed);
    if (!isNaN(parsed)) {
      value[index].address = parsed;
    }
  };

  onMount(() => {
    value = value || [];
    for (let index = 0; index < value.length; index++) {
      selectedAddress.push({
        address: "0x" + value[index].address.toString(16),
      });
    }
    ready = true;
  });
</script>

{#if ready && value && value.length}
  <Table shadow>
    <TableHead>
      <TableHeadCell>{$_t("File")}</TableHeadCell>
      <TableHeadCell>{$_t("Address (Hex)")}</TableHeadCell>
      <TableHeadCell>{$_t(" ")}</TableHeadCell>
    </TableHead>

    <TableBody>
      {#each value as _val, index}
        <TableBodyRow>
          <TableBodyCell>
            <Select
              items={selectValueItems}
              bind:value={value[index].type}
              onchange={() => {
                const val = selectValueItems.find(
                  (item) => item.value === value[index].type,
                );
                selectedAddress[index].address = val?.defValue || "0x0";
                parseInputAndUpdateValue(index);
              }}
            />
          </TableBodyCell>
          <TableBodyCell>
            <Input
              type="text"
              {disabled}
              oninput={() => parseInputAndUpdateValue(index)}
              bind:value={selectedAddress[index].address}
              placeholder="0x1000"
            />
          </TableBodyCell>
          <TableBodyCell>
            <Button
              color="red"
              {disabled}
              size="xs"
              onclick={() => value.splice(index, 1)}><TrashBinOutline /></Button
            >
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <Hr class="my-2" />
{/if}
<div class="flex w-full space-x-2">
  <Button
    class="flex-grow-1"
    {disabled}
    onclick={() => {
      value.push({ address: 0, type: "" });
      selectedAddress.push({ address: "" });
    }}><PlusOutline /> {$_t("Add Partition")}</Button
  >
</div>
