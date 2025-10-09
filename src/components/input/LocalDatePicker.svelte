<script lang="ts">
  import { Datepicker } from "flowbite-svelte";
  let {
    value = $bindable(),
    id,
    required = false,
    maxDate,
    minDate,
    onselect,
    locale = "en-GB",
    defaultDate,
    inline,
    class: className,
    disabled,
  } = $props<{
    required?: boolean;
    value: Date | string | undefined | null;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    id?: string;
    locale?: string;
    defaultDate?: Date | string;
    onselect?: (value: Date | undefined) => void;
    inline?: boolean;
    class?: string;
    disabled?: boolean;
  }>();

  let localModel = $state<Date | undefined>(
    typeof value === "string" ? new Date(value) : value,
  );

  let minLocalDate = $state<Date | undefined>(
    typeof minDate === "string" ? new Date(minDate) : minDate,
  );

  let maxLocalDate = $state<Date | undefined>(
    typeof maxDate === "string" ? new Date(maxDate) : maxDate,
  );
</script>

<Datepicker
  {id}
  {inline}
  class={className}
  inputClass="w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right focus:outline-hidden text-sm px-2.5 py-2.5 border border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg"
  bind:value={localModel}
  onselect={(e) => {
    value = localModel;
    onselect && onselect(localModel);
  }}
  {required}
  availableFrom={minLocalDate}
  {locale}
  availableTo={maxLocalDate}
  {defaultDate}
  {disabled}
/>
