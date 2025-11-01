<script lang="ts">
  import { _t } from "$lib";
  import { Button, Input } from "flowbite-svelte";
  import { TrashBinOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    required = false,
    disabled = false,
  } = $props<{ value?: string[]; disabled?: boolean; required?: boolean }>();

  onMount(() => {
    if (!Array.isArray(value)) {
      value = [];
    }
  });
</script>

<input type="hidden" value={(value || []).join(",")} {required} />

{#if value}
  <div class="flex flex-col w-full space-y-2">
    {#each value as _item, index}
      <div class="flex items-center space-x-2">
        <Input
          {disabled}
          type="text"
          class="flex-grow"
          bind:value={value[index]}
        />
        <Button
          type="button"
          class="ml-auto"
          color="rose"
          {disabled}
          outline
          onclick={() => {
            value.splice(index, 1);
          }}><TrashBinOutline /></Button
        >
      </div>
    {/each}
    <Button
      type="button"
      {disabled}
      onclick={() => {
        value = [...value, ""];
      }}>{$_t("Add Item")}</Button
    >
  </div>
{/if}
