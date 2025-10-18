<script lang="ts">
  import { Button, Input } from "flowbite-svelte";
  import { Toast } from "$components/toasts";
  import { MinusOutline, PlusOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    valid = $bindable(false),
    required,
    onAdd,
    onRemove,
    onChange,
    id = "sting-object-entry",
  } = $props<{
    value?: Record<string, string>;
    required?: boolean;
    onAdd?: () => void;
    onRemove?: () => void;
    onChange?: (val: Record<string, string>) => void;
    id?: string;
    valid?: boolean;
  }>();
  let formEl = $state<HTMLFormElement | undefined>(undefined);
  let localValue = $state<string[][]>([]);

  const checkForm = () => {
    if (!formEl || (required && (!value || Object.keys(value).length === 0))) {
      valid = false;
      return;
    }

    valid = formEl.checkValidity();
    const set = new Set<string>();
    for (const [key, val] of localValue) {
      if (!key || !val || set.has(key)) {
        valid = false;
        break;
      }
      set.add(key);
    }
  };

  const setValues = () => {
    value = {};

    for (const [key, val] of localValue) {
      if (value[key] !== undefined) {
        // Key has changed, remove old key
        Toast.error("Duplicate keys are not allowed");
        continue;
      }
      value[key] = val;
    }
    checkForm();
    onChange && onChange(value);
  };

  const buildValueMap = () => {
    for (const key in value) {
      localValue.push([key, value[key]]);
    }
  };
  onMount(() => {
    if (!value) {
      value = {};
    }
    buildValueMap();
  });
  $effect(() => {
    if (!value && localValue.length) {
      localValue = [];
      value = {};
      buildValueMap();
    }
  });
</script>

<form class="w-full" bind:this={formEl} oninput={checkForm}>
  <input
    type="hidden"
    {id}
    {required}
    name={id}
    value={Object.keys(value || {}).length > 0
      ? JSON.stringify(value)
      : undefined}
  />
  {#if value}
    <div class="flex-col space-y-2">
      {#each localValue as [key], index}
        <div class="flex space-x-1">
          <Input
            type="text"
            id={id + "-key"}
            name={key + "key"}
            bind:value={localValue[index][0]}
            oninput={setValues}
            required={true}
            color={localValue[index][0] ? undefined : "red"}
          />
          <Input
            type="text"
            id={id + "-val"}
            name={key + "value"}
            bind:value={localValue[index][1]}
            required={true}
            oninput={setValues}
            color={localValue[index][1] ? undefined : "red"}
          />
          <Button
            onclick={() => {
              localValue.splice(index, 1);
              setValues();
              onRemove && onRemove();
              checkForm();
            }}
            color="alternative"><MinusOutline /></Button
          >
        </div>
      {/each}
      <Button
        onclick={() => {
          localValue.push(["", ""]);
          setValues();
          onAdd && onAdd();
        }}><PlusOutline /></Button
      >
    </div>
  {/if}
</form>
