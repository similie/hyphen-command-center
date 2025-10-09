<script lang="ts">
  import { Label, Select } from "flowbite-svelte";
  import { _t } from "$lib";
  import { onMount } from "svelte";

  let { value = $bindable() } = $props<{ value?: string }>();

  const locales = [
    { value: "en-US", name: "en-US (US)" },
    { value: "en-GB", name: "en-GB (UK)" },
    { value: "de", name: "de (Germany)" },
    { value: "fr", name: "fr (France)" },
    { value: "ja", name: "ja (Japan)" },
  ];
  onMount(() => {
    if (value) {
      return;
    }
    value = "en-GB";
  });
</script>

<Label for="localeSelect" class="mb-2">{$_t("Locale")}</Label>
<Select id="localeSelect" items={locales} bind:value></Select>
