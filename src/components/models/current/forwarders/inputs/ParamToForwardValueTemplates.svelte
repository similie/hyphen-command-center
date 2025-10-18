<script lang="ts">
  import InputItemsRow from "$components/input/InputItemsRow.svelte";
  import type {
    ParameterToForwardDetails,
    ParameterToForwardValue,
  } from "$lib";
  import { Button, Label, Input, Toggle } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { _t } from "$lib";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import InputFormItem from "$components/input/InputFormItem.svelte";

  let { value = $bindable(), disabled = false } = $props<{
    value?: ParameterToForwardDetails[];
    disabled?: boolean;
  }>();

  onMount(() => {
    value = value || [];
  });

  const addParam = () => {
    value = value || [];
    value.push({ key: "", value: "", required: false });
  };
</script>

{#each value as _param, index}
  <InputItemsRow class="items-center">
    <InputFormItem grow>
      <Label>{$_t("Parameter Key")}</Label>
      <Input {disabled} bind:value={value[index].key} required />
    </InputFormItem>
    <InputFormItem grow>
      <Label
        >{$_t("Parameter Value")}
        <small>{$_t("Ignored if derived")}</small></Label
      >
      <Input
        disabled={value[index].derived || disabled}
        bind:value={value[index].value}
      />
    </InputFormItem>
    <InputFormItem shrink>
      <Toggle class="mt-4" bind:checked={value[index].derived}
        >{$_t("Derived")}</Toggle
      >
    </InputFormItem>
    <InputFormItem shrink>
      <Label class="mt-4"><span></span></Label>
      <Button
        {disabled}
        pill
        size="xs"
        outline
        onclick={() => value.splice(index, 1)}><TrashBinOutline /></Button
      >
    </InputFormItem>
  </InputItemsRow>
{/each}

<InputItemsRow class="mt-4">
  <Label
    >{$_t(
      "If derived enabled, the parameter is pulled from the forwarder parameter context. Value is used for a static header such as",
    )}: "Content-Type": "Application/json"
  </Label>
  <InputFormItem>
    <Button {disabled} onclick={() => addParam()}><PlusOutline /></Button>
  </InputFormItem>
</InputItemsRow>
