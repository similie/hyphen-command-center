<script lang="ts">
  import { onMount } from "svelte";
  import { _t } from "$lib";
  import { A, P } from "flowbite-svelte";

  let {
    value = $bindable(),
    edit = true,
    onChange,
    id,
    required,
    sm,
  } = $props<{
    value: number[];
    onChange?: (value: number[]) => void;
    edit?: boolean;
    id?: string;
    required?: boolean;
    sm?: boolean;
  }>();
  let daysValues = $state<string | null>(null);
  let hiddenEl = $state<HTMLInputElement | null>(null);
  const sendEvents = () => {
    hiddenEl && hiddenEl.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenEl && hiddenEl.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const setValues = () => {
    if (!value || !value.length) {
      daysValues = null;
      return sendEvents();
    }

    daysValues = $state.snapshot(value).join(",");
    value.sort((a: number, b: number) => a - b);
    onChange && onChange(value);

    sendEvents();
  };

  onMount(() => {
    value = value ?? [];
    setValues();
  });

  const daysOfWeek = [
    { value: 0, label: $_t("Sunday") },
    { value: 1, label: $_t("Monday") },
    { value: 2, label: $_t("Tuesday") },
    { value: 3, label: $_t("Wednesday") },
    { value: 4, label: $_t("Thursday") },
    { value: 5, label: $_t("Friday") },
    { value: 6, label: $_t("Saturday") },
  ];
</script>

{#if edit}
  <div class="mt-1 flex flex-wrap gap-1">
    {#each daysOfWeek as d}
      {#if value && value.some((v: number) => v === d.value)}
        <A
          class="inline-flex items-center gap-1 rounded-lg border dark:text-gray-700 border-primary-300 dark:border-primary-600 dark:bg-primary-200 bg-primary-50 px-2 py-1 text-sm text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onclick={() => {
            value.splice(value.indexOf(d.value), 1);
            setValues();
          }}
        >
          {d.label}
        </A>
      {:else}
        <A
          href="#"
          class="inline-flex items-center gap-1 rounded-lg border  border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:text-gray-700"
          onclick={() => value.push(d.value) && setValues()}
        >
          {d.label}
        </A>
      {/if}
    {/each}
  </div>
  <div class="relative">
    <input
      type="text"
      class="sr-only"
      bind:this={hiddenEl}
      value={daysValues}
      {id}
      {required}
    />
  </div>
{:else}
  <div class="mt-1 flex flex-wrap gap-1">
    {#each daysOfWeek as d}
      {#if value && value.some((v: number) => v === d.value)}
        {#if sm}
          <P
            size="xs"
            class="inline-flex items-center rounded-lg border dark:border-primary-600 dark:bg-primary-200 dark:text-gray-700 border-primary-300 bg-primary-50 px-1 text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {d.label}
          </P>
        {:else}
          <P
            class="inline-flex items-center gap-1 rounded-lg border dark:border-primary-600 dark:bg-primary-200 dark:text-gray-700 border-primary-300 bg-primary-50 px-2 py-1 text-sm text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {d.label}
          </P>
        {/if}
      {/if}
    {/each}
  </div>
{/if}
