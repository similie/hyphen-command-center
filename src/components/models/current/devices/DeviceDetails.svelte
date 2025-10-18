<script lang="ts">
  import { InputFormItem, InputItemsRow } from "$components/input";
  import {
    _t,
    copyToClipboard,
    DeviceCertificate,
    DeviceModel,
    type IDevice,
  } from "$lib";
  import { A, Card, Heading, Input, Label, P, Textarea } from "flowbite-svelte";
  import { Toast } from "$components";
  import {
    BanOutline,
    DownloadOutline,
    EditOutline,
    FloppyDiskOutline,
  } from "flowbite-svelte-icons";
  import DateFormat from "$components/content/DateFormat.svelte";

  const api = new DeviceModel();
  const cApi = new DeviceCertificate();
  let { device, editable = false } = $props<{
    device: IDevice;
    editable?: boolean;
  }>();
  let editProps = $state<Record<string, boolean>>({});
  let name = $state(device.name || "");
  let notes = $state(device.notes || "");
  const editName = async () => {
    if (!name) {
      return;
    }
    editProps.deviceName = false;
    if (name === device.name) {
      return;
    }
    try {
      await api.update({ id: device.id }, { name });
      device.name = name;
    } catch (e) {
      console.error("Error saving device name", e);
    }
  };

  const editNotes = async () => {
    if (!notes) {
      return;
    }
    editProps.deviceNotes = false;
    if (notes === device.notes) {
      return;
    }
    try {
      await api.update({ id: device.id }, { notes });
      device.notes = notes;
    } catch (e) {
      console.error("Error saving device notes", e);
    }
  };

  const download = () => {
    cApi.download(device.identity).catch((e) => {
      console.error("Error downloading device certificates", e);
    });
  };

  const copyToClipboardLocal = (textToCopy: string) => {
    copyToClipboard(textToCopy, () => {
      Toast.success("Text copied to clipboard");
    });
  };
</script>

<Card
  class="w-full dark:bg-gray-950 flex flex-col p-6 max-w-full overflow-hidden space-y-4"
>
  <InputItemsRow>
    <InputFormItem>
      <Heading tag="h5" class="text-primary-600"
        >{$_t("Device Details")}</Heading
      >
    </InputFormItem>
    <InputFormItem>
      {#if editable}
        <A class="ml-auto" onclick={download}
          ><DownloadOutline /> {$_t("Download Device Certificates")}</A
        >
      {/if}
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Device Name")}</Label>

      <div class="flex space-x-2">
        {#if !editProps.deviceName}
          <P>{device.name}</P>
          {#if editable}
            <A onclick={() => (editProps.deviceName = true)}><EditOutline /></A>
          {/if}
        {:else if editable}
          <Input size="sm" type="text" bind:value={name} required />

          <A disabled={!name} onclick={editName}>
            {#if !name}
              <BanOutline />
            {:else}
              <FloppyDiskOutline />
            {/if}
          </A>
        {/if}
      </div>
    </InputFormItem>

    <InputFormItem>
      <Label>{$_t("Device Identity")}</Label>
      <A onclick={() => copyToClipboardLocal(device.identity)}
        >{device.identity}</A
      >
    </InputFormItem>
  </InputItemsRow>

  <InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Created On")}</Label>
      <DateFormat stamp={device.createdAt} />
    </InputFormItem>
    <InputFormItem>
      <Label>{$_t("Last Seen")}</Label>
      <DateFormat stamp={device.lastTouched} />
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem grow>
      <Label>{$_t("Notes")}</Label>
      <div class="flex space-x-2 w-full items-start">
        {#if !editProps.deviceNotes}
          <P>{device.notes}</P>
          {#if editable}
            <A onclick={() => (editProps.deviceNotes = true)}><EditOutline /></A
            >
          {/if}
        {:else if editable}
          <Textarea divClass="w-full" class="w-full" bind:value={notes}
          ></Textarea>

          <A disabled={!name} onclick={editNotes}>
            <FloppyDiskOutline />
          </A>
        {/if}
      </div></InputFormItem
    ></InputItemsRow
  >
</Card>
