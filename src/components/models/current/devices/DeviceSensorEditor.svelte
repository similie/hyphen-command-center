<script lang="ts">
  import {
    AvatarBuilder,
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
    StringArrayInput,
    StringObjectInput,
  } from "$components/input";
  import { DestroyModelModal } from "$components/models/destroy";
  import {
    SensorModel,
    type ISensor,
    _t,
    emitEvent,
    Debounce,
    SensorTypeName,
    SensorType,
  } from "$lib";
  import {
    Button,
    ButtonGroup,
    Helper,
    Input,
    Label,
    Select,
    Textarea,
  } from "flowbite-svelte";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  let { value = $bindable(), onDelete } = $props<{
    value?: ISensor;
    onDelete?: (prof: ISensor) => void;
  }>();
  const api = new SensorModel();
  let destroyValueBind = $state(false);
  let savedSensor = $state<Partial<ISensor>>(value || {});
  let saving = $state(false);
  let valid = $state(false);
  let formElement: HTMLFormElement;
  const handleSubmit = async () => {
    try {
      saving = true;
      if (savedSensor.id) {
        savedSensor = await api.save(savedSensor as ISensor);
        emitEvent<ISensor>("sensor:created", savedSensor as ISensor);
      } else {
        const result = await api.create(savedSensor);
        savedSensor = {};
        emitEvent<ISensor>("sensor:created", result);
      }
    } catch (e) {
      console.error("Error saving sensor:", e);
    } finally {
      saving = false;
    }
  };
  const handleDestroy = async () => {
    try {
      saving = true;
      await api.destroy(savedSensor as ISensor);
      onDelete?.(savedSensor as ISensor);
      emitEvent<ISensor>("sensor:destroyed", savedSensor as ISensor);
    } catch (e) {
      console.error("Error destroying repository:", e);
    } finally {
      saving = false;
    }
  };
  let validName = $state(true);

  const checkValidity = () => {
    valid = (validName && formElement?.checkValidity()) || false;
  };

  const debounce = new Debounce();

  const validNameCheck = debounce.bounce(async () => {
    savedSensor.identity = savedSensor.identity?.trim().replaceAll(/\s+/g, "_");
    const results = await api.find({ identity: savedSensor.identity }).fetch();
    validName =
      results.length === 0 ||
      (results.length === 1 && results[0].id === savedSensor.id);
  }, 500);
  let selectItems: { name: string; value: string }[] = $state([]);
  onMount(() => {
    for (const key in SensorTypeName) {
      selectItems.push({
        name: SensorTypeName[key as keyof typeof SensorTypeName],
        value: key,
      });
    }
  });
</script>

<DestroyModelModal
  bind:open={destroyValueBind}
  onDestroy={handleDestroy}
  title={"Destroy Repository"}
  body={"Are you sure you want to destroy this repository?"}
/>

<form
  bind:this={formElement}
  onsubmit={handleSubmit}
  class="space-y-4"
  oninput={checkValidity}
>
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel content="Name" />
      <ButtonGroup class="w-full">
        <Input disabled={saving} bind:value={savedSensor.name} required />
        <AvatarBuilder
          square
          disabled={saving}
          bind:avatar={savedSensor.avatar}
        />
      </ButtonGroup>
    </InputFormItem>
    <InputFormItem>
      <RequiredLabel content="Identity" />

      <Input
        disabled={saving}
        required
        color={validName ? undefined : "red"}
        bind:value={savedSensor.identity}
        oninput={validNameCheck}
      />
      {#if !validName}
        <Helper color="red">
          {$_t(
            "A sensor with this identity already exists. Please choose a different identity.",
          )}
        </Helper>
      {/if}
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel content={"Sensor Type"} />

      <Select
        items={selectItems}
        bind:value={savedSensor.sensorType}
        required
      />
    </InputFormItem>
    <InputFormItem>
      <RequiredLabel content="Max Count"
        >&nbsp;<em>{$_t("Zero for unlimited")}</em></RequiredLabel
      >
      <Input type="number" required bind:value={savedSensor.max} min="0" />
    </InputFormItem>
  </InputItemsRow>
  <InputFormItem>
    <Label>{$_t("Description")}</Label>
    <Textarea bind:value={savedSensor.description} class="w-full" />
  </InputFormItem>

  <InputFormItem>
    <Label>{$_t("Available Pins")}</Label>
    <StringArrayInput disabled={saving} bind:value={savedSensor.pins} />
  </InputFormItem>

  <InputFormItem>
    <Label>{$_t("Metadata (JSON)")}</Label>
    <StringObjectInput bind:value={savedSensor.meta} />
  </InputFormItem>
  <InputItemsRow class="w-full">
    {#if savedSensor.id}
      <Button
        type="button"
        color="red"
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
