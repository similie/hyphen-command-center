<script lang="ts">
  import { _t } from "$lib";
  import {
    Button,
    Fileupload,
    Hr,
    Input,
    Select,
    Spinner,
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
    onFlash,
    flashing = $bindable(),
  } = $props<{
    value?: { address: number; data: string }[];
    onFlash?: (value: { address: number; data: string }[]) => void;
    flashing?: boolean;
  }>();
  let selectedAddress = $state<{ select: string; input: string }[]>([]);
  //   function fileToBase64_byBinaryString(file: File): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onerror = () =>
  //         reject(reader.error || new Error("FileReader failed"));
  //       reader.onload = () => {
  //         const binaryString = reader.result as string; // each char’s code = byte
  //         const base64 = btoa(binaryString);
  //         resolve(base64);
  //       };
  //       reader.readAsBinaryString(file);
  //     });
  //   }
  const selectValueItems = [
    { value: "0x0", name: "0x0 - Other" },
    {
      value: "0x1000",
      name: "0x1000 - Bootloader",
    },
    {
      value: "0x8000",
      name: "0x8000 - Partition Table",
    },
    {
      value: "0x10000",
      name: "0x10000 - Application",
    },
    {
      value: "0x590000",
      name: "0x590000 - OTA Data",
    },
    {
      value: "0xB10000",
      name: "0xB10000 - Spiffs Data",
    },
  ];

  let valid = $derived(() => {
    return (
      value.length > 0 &&
      value.every((v: any) => v.data && v.address !== undefined) &&
      !flashing
    );
  });

  const chooseFirmware = (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (ev: ProgressEvent<FileReader>) => {
      if (!value[index]) {
        value[index] = { address: 0, data: "" };
      }
      value[index].data = ev.target?.result;
    };

    reader.readAsBinaryString(file);
  };

  const parseInputAndUpdateValue = (input: string, index: number) => {
    const parsed = parseInt(input, 16);
    console.log("Parsed address input:", input, parsed);
    if (!isNaN(parsed)) {
      value[index].address = parsed;
    }
  };

  onMount(() => {
    value = value || [];
  });
</script>

{#if value && value.length}
  <Table shadow>
    <TableHead>
      <TableHeadCell>{$_t("File")}</TableHeadCell>
      <TableHeadCell>{$_t("Address (Hex)")}</TableHeadCell>
      <TableHeadCell>{$_t(" ")}</TableHeadCell>
    </TableHead>

    <TableBody>
      {#each value as _, index}
        <TableBodyRow>
          <TableBodyCell>
            <Fileupload
              id={"file_upload_" + { index }}
              onchange={(e) => chooseFirmware(e, index)}
              size="sm"
              accept=".bin"
              disabled={flashing}
            />
          </TableBodyCell>
          <TableBodyCell>
            <Select
              size="sm"
              bind:value={selectedAddress[index].select}
              items={selectValueItems}
              disabled={flashing}
              onchange={() =>
                parseInputAndUpdateValue(selectedAddress[index].select, index)}
            />

            {#if selectedAddress[index]?.select === "0x0"}
              <Input
                type="text"
                class="mt-2"
                disabled={flashing}
                oninput={() =>
                  parseInputAndUpdateValue(selectedAddress[index].input, index)}
                bind:value={selectedAddress[index].input}
                placeholder="0x1000"
              />
            {/if}
          </TableBodyCell>
          <TableBodyCell>
            <Button
              color="red"
              disabled={flashing}
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
    disabled={flashing}
    onclick={() => {
      value.push({ address: 0, data: "" });
      selectedAddress.push({ select: "", input: "" });
    }}><PlusOutline /> {$_t("Add Firmware")}</Button
  >

  <Button
    class="ml-auto"
    outline
    disabled={!valid()}
    onclick={() => onFlash?.(value)}
  >
    {#if flashing}
      <Spinner size={"4"} class="mr-2" />
      {$_t("Flashing")}…
    {:else}
      {$_t("Flash Firmware")}
    {/if}
  </Button>
</div>
