<script lang="ts">
  import { DynamicForm2 } from "$components/input";
  import { extractFormToJson, type FormField, type IDeviceProfile } from "$lib";
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
  onMount(() => {
    if (!profile) {
      return;
    }
    for (const key in profile.configSchema) {
      const fieldDef = profile.configSchema[key];
      const defVal = profile.defConfigSchema[key];
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

    console.log("Generated fields for DynamicForm2:", fields);
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
