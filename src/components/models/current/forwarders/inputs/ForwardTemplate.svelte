<script lang="ts">
  import {
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
  } from "$components/input";
  import { _t, ForwarderTargetKind, type ForwarderTargetTemplates } from "$lib";
  import { Helper, Input, Label, Select } from "flowbite-svelte";
  import ParamToForwardValueTemplates from "./ParamToForwardValueTemplates.svelte";

  let { value = $bindable(), disabled = false } = $props<{
    value: ForwarderTargetTemplates;
    disabled?: boolean;
  }>();

  const httpMethods = [
    { value: "POST", name: "POST" },
    { value: "GET", name: "GET" },
    { value: "PUT", name: "PUT" },
    { value: "DELETE", name: "DELETE" },
    { value: "PATCH", name: "PATCH" },
  ];
</script>

<div class="flex flex-col space-y-4 w-full">
  {#if value.kind === ForwarderTargetKind.HTTP}
    <InputItemsRow>
      <InputFormItem grow>
        <RequiredLabel content={$_t("Host URL")} />
        <Input {disabled} bind:value={value.urlTemplate} required />
        <Helper
          >{$_t(
            "Values from context will be interpolated, for example: /api/v1/devices/{device.identity}",
          )}</Helper
        >
      </InputFormItem>
      <InputFormItem shrink>
        <Label>{$_t("HTTP Method")}</Label>
        <Select {disabled} bind:value={value.method} items={httpMethods} />
      </InputFormItem>
    </InputItemsRow>

    <InputItemsRow>
      <InputFormItem>
        <Label>{$_t("HTTP Headers")}</Label>
        <ParamToForwardValueTemplates
          {disabled}
          bind:value={value.headers}
        /></InputFormItem
      >
    </InputItemsRow>

    <InputItemsRow>
      <InputFormItem>
        <Label>{$_t("Body Values")}</Label>
        <ParamToForwardValueTemplates
          {disabled}
          bind:value={value.bodyTemplate}
        />
      </InputFormItem>
    </InputItemsRow>
  {:else if value.kind === ForwarderTargetKind.MQTT}
    <InputItemsRow>
      <InputFormItem grow>
        <RequiredLabel content={$_t("Host URL")} />
        <Input {disabled} bind:value={value.urlTemplate} required />
        <Helper
          >{$_t(
            "Values from context will be interpolated, for example: /api/v1/devices/{device.identity}",
          )}</Helper
        >
      </InputFormItem>
    </InputItemsRow>
    <InputItemsRow>
      <InputFormItem>
        <Label>{$_t("Body Values")}</Label>
        <ParamToForwardValueTemplates
          {disabled}
          bind:value={value.bodyTemplate}
        />
      </InputFormItem>
    </InputItemsRow>
  {/if}
</div>
