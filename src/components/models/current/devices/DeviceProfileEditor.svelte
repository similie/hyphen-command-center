<script lang="ts">
  import {
    AvatarBuilder,
    InputItemsRow,
    StringObjectInput,
    RequiredLabel,
    InputFormItem,
  } from "$components/input";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";
  import { Toast } from "$components/toasts";

  import { _t, DeviceProfile, emitEvent, type IDeviceProfile } from "$lib";
  import {
    Button,
    ButtonGroup,
    Hr,
    Input,
    Label,
    Select,
    Textarea,
    Toggle,
  } from "flowbite-svelte";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import { DeviceRepositoriesSelect, PartitionTableDetails } from ".";
  import { updateProfileInStore } from "$lib/stores/deviceProfiles";
  const api = new DeviceProfile();
  let { profile = $bindable(), onDelete } = $props<{
    profile?: IDeviceProfile;
    onDelete?: (prof: IDeviceProfile) => void;
  }>();
  let setProfile = $state<Partial<IDeviceProfile>>(
    profile ? profile : { defConfigSchema: {}, configSchema: {}, offline: 15 },
  );
  let destroyValueBind = $state<boolean>(false);
  let formElement: HTMLFormElement;
  let valid = $state(false);
  let saving = $state(false);
  let newConfigKey = $state("");
  const validateForm = () => {
    valid = formElement?.checkValidity() || false;
  };

  const schemaItems = [
    { name: "String", value: "string" },
    { name: "Number", value: "number" },
    { name: "Boolean", value: "boolean" },
    { name: "Array", value: "array" },
    { name: "Object", value: "object" },
  ];

  const onSave = async () => {
    saving = true;
    try {
      if (setProfile.id) {
        const result = await api.save(
          $state.snapshot(setProfile) as IDeviceProfile,
        );
        setProfile = result;
        emitEvent<IDeviceProfile>("deviceprofile:created", result);
        updateProfileInStore(result);
      } else {
        const value = await api.create(setProfile as IDeviceProfile);
        setProfile = { defConfigSchema: {}, configSchema: {} };
        emitEvent<IDeviceProfile>("deviceprofile:created", value);
      }
      Toast.success("Profile saved successfully");
      //   formElement?.reset();
    } catch (e) {
      console.error("Error saving device profile:", e);
    } finally {
      valid = false;
      saving = false;
    }
  };

  const destroyValue = () => {
    if (!setProfile.id) {
      return;
    }
    saving = true;
    api
      .destroy(setProfile)
      .then(() => {
        onDelete && onDelete(setProfile as IDeviceProfile);
        emitEvent<IDeviceProfile>(
          "deviceprofile:deleted",
          setProfile as IDeviceProfile,
        );
      })
      .catch((e) => {
        console.error("Error deleting device profile:", e);
      })
      .finally(() => {
        saving = false;
      });
  };
</script>

<DestroyModelModal
  bind:open={destroyValueBind}
  title={$_t("Delete Device Profile")}
  onDestroy={destroyValue}
  body="Are you sure you want to delete this device profile? This action cannot be undone and will impact devices using this profile."
/>

<form
  bind:this={formElement}
  oninput={validateForm}
  onsubmit={onSave}
  class="space-y-6"
>
  <!-- Form fields for editing the device profile would go here -->
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel content="Name" />
      <ButtonGroup class="flex items-stretch">
        <Input
          class="h-11"
          size="md"
          disabled={saving}
          bind:value={setProfile.name}
        />
        <AvatarBuilder
          square
          size="md"
          disabled={saving}
          bind:avatar={setProfile.avatar}
        />
      </ButtonGroup>
    </InputFormItem>
    <InputFormItem>
      <Label>{$_t("Build Repository")}</Label>
      <DeviceRepositoriesSelect bind:value={setProfile.repository} />
    </InputFormItem>
    <InputFormItem>
      <Label
        >{$_t("Offline After")} <small>({$_t("time in minutes")})</small></Label
      >
      <Input type="number" bind:value={setProfile.offline} min={0} />
    </InputFormItem>
    <InputFormItem shrink>
      <Label>{$_t("Cloud Flash")}</Label>
      <Toggle bind:checked={setProfile.cloudFlash}></Toggle>
    </InputFormItem>
  </InputItemsRow>
  <PartitionTableDetails bind:value={setProfile.partitions} />
  <InputFormItem>
    <RequiredLabel content="Build Script" />
    <Textarea
      disabled={saving}
      class="w-full"
      bind:value={setProfile.script}
      rows={12}
    />
  </InputFormItem>

  <InputFormItem>
    <Label>{$_t("Config Profile")}</Label>
    {#if !saving}
      {#each Object.entries(setProfile.configSchema || {}) as [key, val]}
        <InputItemsRow class="space-y-2">
          <Input disabled value={key} />
          <Select
            disabled={saving}
            items={schemaItems}
            bind:value={setProfile.configSchema![key]}
          />
        </InputItemsRow>
      {/each}
    {/if}
    <InputItemsRow class="mt-2">
      <Button
        disabled={!newConfigKey || saving}
        onclick={() => {
          if (!newConfigKey) {
            return;
          }
          setProfile.configSchema![newConfigKey] = "string";
        }}><PlusOutline /></Button
      >
      <Input placeholder="New Config Key" bind:value={newConfigKey} />
    </InputItemsRow>

    <InputFormItem class="mt-2">
      <Label>{$_t("Default Config Schema (JSON)")}</Label>
      <StringObjectInput
        onChange={validateForm}
        disabled={saving}
        bind:value={setProfile.defConfigSchema}
      />
    </InputFormItem>
  </InputFormItem>

  <Hr class="my-4" />
  <InputItemsRow class="w-full">
    {#if setProfile.id}
      <Button
        type="button"
        color="rose"
        outline
        disabled={saving}
        onclick={() => (destroyValueBind = true)}><TrashBinOutline /></Button
      >
    {/if}
    <Button class="w-full" type="submit" disabled={!valid || saving}
      ><PlusOutline /> {$_t("Save")}</Button
    >
  </InputItemsRow>
</form>
