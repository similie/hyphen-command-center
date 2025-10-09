<script lang="ts">
  import { generateUniqueUUID, type SelectOptionValues } from "$lib";
  import { Button, Input } from "flowbite-svelte";
  import { MinusOutline, PlusOutline } from "flowbite-svelte-icons";

  let {
    selectOption = $bindable([]),
    required,
    noEmpty = false,
  } = $props<{
    selectOption: SelectOptionValues[];
    required?: boolean;
    noEmpty?: boolean;
  }>();

  const hasNullValue = () => {
    for (const op of selectOption) {
      if (op.value === null) {
        return true;
      }
    }
    return false;
  };

  $effect(() => {
    if (noEmpty) {
      return;
    }
    const hasNull = hasNullValue();
    if (!required && !hasNull) {
      selectOption.unshift({ value: null, name: "" });
    } else if (required && hasNull) {
      selectOption = selectOption.filter(
        (op: SelectOptionValues) => op.value !== null,
      );
    }
  });

  const onRemove = (value: string) => {
    selectOption = selectOption.filter(
      (option: SelectOptionValues) => option.value !== value,
    );
  };

  const onAdd = () => {
    selectOption.push({ value: generateUniqueUUID(), name: "" });
  };
</script>

<div class="flex-col space-y-2">
  {#each selectOption as option (option.value)}
    {#if option.value}
      <div class="flex space-x-2 items-center">
        <div class="flex-grow">
          <Input type="text" bind:value={option.name} />
        </div>

        <Button
          onclick={() => onRemove(option.value)}
          class="ml-auto"
          color="alternative"><MinusOutline /></Button
        >
      </div>
    {/if}
  {/each}

  <Button onclick={onAdd}><PlusOutline /></Button>
</div>
