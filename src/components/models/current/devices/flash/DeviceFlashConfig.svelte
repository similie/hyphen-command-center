<script lang="ts">
  import { DynamicForm2 } from "$components/input";
  import {
    ConnectionType,
    ConnectionTypeNames,
    extractFormToJson,
    type FormField,
    type IDeviceProfile,
  } from "$lib";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    profile,
    disabled = false,
  } = $props<{
    value: { [key: string]: any };
    profile: IDeviceProfile;
    disabled?: boolean;
  }>();
  const fields = $state<FormField[]>([]);
  const localData = $state<{ [key: string]: any }>(
    value || profile.defConfigSchema || {},
  );

  const onsubmit = (data: FormData) => {
    const values = extractFormToJson(data);
    value = values;
  };

  /**
   * 
   export enum ConnectionType {
  WIFI_PREFERRED,
  CELLULAR_PREFERRED,
  WIFI_ONLY,
  CELLULAR_ONLY,
  NONE,
} 

export const ConnectionTypeNames = {
  "0": "WiFi Preferred",
  "1": "Cellular Preferred",
  "2": "WiFi Only",
  "3": "Cellular Only",
  "4": "None",
};
   */

  const getConnectionTypeOptions = () => {
    const values = [];
    for (const key in ConnectionTypeNames) {
      if (isNaN(Number(key))) {
        continue;
      }
      values.push({
        name: ConnectionTypeNames[key as keyof typeof ConnectionTypeNames],
        value: key,
      });
    }
    return values;
  };
  const connectionSelectOptions = getConnectionTypeOptions();
  const selectOptions: FormField = $state({
    type: "select",
    selectOptions: connectionSelectOptions,
    required: true,
    name: "connection_type",
    label: "Connection Type",
    value: ConnectionType.CELLULAR_PREFERRED,
  });

  onMount(() => {
    if (!profile) {
      return;
    }
    for (const key in profile.configSchema) {
      const defVal = profile.defConfigSchema[key];
      const fieldDef = profile.configSchema[key];
      if (key === "connection_type" && fieldDef === "number") {
        selectOptions.value = defVal || selectOptions.value;
        fields.push(selectOptions);
        continue;
      }

      const field: FormField = {
        name: key,
        label: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        type: fieldDef,
        value: defVal ?? null,
        required: false,
      };
      fields.push(field);
    }
  });
</script>

{#if fields && fields.length}
  <DynamicForm2
    {fields}
    edit={!disabled}
    cols={2}
    model={localData}
    hideControls
    {onsubmit}
  />
{/if}
