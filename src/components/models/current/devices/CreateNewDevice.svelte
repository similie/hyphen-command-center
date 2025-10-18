<script lang="ts">
  import { goto } from "$app/navigation";
  import { InputFormItem, InputItemsRow, Toast } from "$components";
  import RequiredLabel from "$components/input/RequiredLabel.svelte";
  import { _t, DeviceModel, generateRandomUsername, type IDevice } from "$lib";

  import {
    Button,
    Heading,
    Hr,
    Input,
    Label,
    Spinner,
    Textarea,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  let submitting = $state(false);
  let disabledSubmit = $state(true);
  let el = $state<HTMLFormElement | null>(null);
  let newDevice = $state<Partial<IDevice>>({
    name: generateRandomUsername(undefined, true),
  });
  const api = new DeviceModel();

  const sendDevice = async () => {
    try {
      submitting = true;
      const device = await api.create(newDevice);
      if (!device || !device.id) {
        throw new Error("Failed to create device");
      }
      goto(`/devices/${device.id}`);
      Toast.success("Device created successfully");
    } catch (error) {
      console.error("Error creating device:", error);
      Toast.error("Error creating device");
    } finally {
      submitting = false;
    }
  };

  const checkFormValidity = () => {
    if (!el) return;
    disabledSubmit = !el.checkValidity();
  };

  onMount(() => {
    checkFormValidity();
  });
</script>

{#if submitting}
  <Heading class="text-center" tag="h3"
    >{$_t("Creating Device...")} <Spinner /></Heading
  >
{:else}
  <form
    bind:this={el}
    class="space-y-6"
    oninput={checkFormValidity}
    onsubmit={sendDevice}
  >
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel content={$_t("Device Name")} />
        <Input type="text" required bind:value={newDevice.name} />
      </InputFormItem>
      <InputFormItem>
        <Label
          >{$_t("Device ID")}
          <small>{$_t("Leave blank to autogenerate")}</small></Label
        >
        <Input
          type="text"
          bind:value={newDevice.identity}
          placeholder={$_t("This must be a unique identifier")}
        />
      </InputFormItem>
    </InputItemsRow>

    <InputItemsRow>
      <InputFormItem>
        <Label>{$_t("Notes")}</Label>
        <Textarea rows={3} class="w-full" bind:value={newDevice.notes} />
      </InputFormItem>
    </InputItemsRow>

    <Hr />

    <InputItemsRow>
      <Button
        class="ml-auto"
        type="submit"
        disabled={disabledSubmit || submitting}
        >{submitting ? $_t("Creating...") : $_t("Create Device")}</Button
      >
    </InputItemsRow>
  </form>
{/if}
