<script lang="ts">
  import type { FlashOptions } from "$lib/utils/flash-tools";
  import {
    Accordion,
    AccordionItem,
    Label,
    P,
    Select,
    Toggle,
  } from "flowbite-svelte";
  import { _t } from "$lib";
  import { InputItemsRow, InputFormItem } from "$components/input";
  import type { Snippet } from "svelte";

  let { options = $bindable(), children } = $props<{
    options: FlashOptions;
    children?: Snippet;
  }>();

  const selectOptions = [
    { name: "dio", value: "dio" },
    { name: "qio", value: "qio" },
    { name: "dout", value: "dout" },
    { name: "qout", value: "qout" },
  ];
  const freqOptions = [
    { name: "40 MHz", value: "40m" },
    { name: "26 MHz", value: "26m" },
    { name: "20 MHz", value: "20m" },
    { name: "80 MHz", value: "80m" },
  ];

  const flashSizeOptions = [
    { name: "4 MB", value: "4MB" },
    { name: "8 MB", value: "8MB" },
    { name: "16 MB", value: "16MB" },
    { name: "32 MB", value: "32MB" },
  ];

  const baudRateOptions = [
    { name: "115200", value: 115200 },
    { name: "230400", value: 230400 },
    { name: "460800", value: 460800 },
    { name: "921600", value: 921600 },
  ];
</script>

<Accordion flush>
  <AccordionItem>
    {#snippet header()}
      <P>{$_t("Advanced Flash Options")}</P>
    {/snippet}
    <InputFormItem class="space-y-4">
      <InputFormItem>
        <Label for="eraseAll">{$_t("Erase All")}</Label>
        <Toggle bind:checked={options.eraseAll} id="eraseAll" />
      </InputFormItem>
      <InputItemsRow>
        <InputFormItem>
          <Label for="flashMode">{$_t("Flash Mode")}</Label>
          <Select
            items={selectOptions}
            bind:value={options.flashMode}
            id="flashMode"
          />
        </InputFormItem>
        <InputFormItem>
          <Label for="flashFreq">{$_t("Flash Frequency")}</Label>
          <Select
            items={freqOptions}
            bind:value={options.flashFreq}
            id="flashFreq"
          />
        </InputFormItem>
      </InputItemsRow>

      <InputItemsRow>
        <InputFormItem>
          <Label for="flashSize">{$_t("Flash Size")}</Label>
          <Select
            items={flashSizeOptions}
            bind:value={options.flashSize}
            id="flashSize"
          />
        </InputFormItem>
        <InputFormItem>
          <Label for="baudRate">{$_t("Upload Baud Rate")}</Label>
          <Select
            items={baudRateOptions}
            bind:value={options.baudRate}
            id="baudRate"
          />
        </InputFormItem>
      </InputItemsRow>
    </InputFormItem>
  </AccordionItem>
  {#if children}
    {@render children()}
  {/if}
</Accordion>
