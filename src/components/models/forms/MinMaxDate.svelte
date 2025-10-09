<script lang="ts">
  import { _t, type FormModelValue } from "$lib";
  import { Label, Datepicker } from "flowbite-svelte";
  import { InputItemsRow, InputFormItem } from "$components";
  let { createModel = $bindable(), onchange } = $props<{
    createModel: Partial<FormModelValue>;
    onchange?: () => void;
  }>();
</script>

<InputItemsRow>
  <InputFormItem>
    <Label for="minDateLength" class="mb-2">{$_t("Min Date")}</Label>
    <Datepicker
      bind:value={createModel.min}
      id="minDateLength"
      availableTo={createModel.max}
      {onchange}
      placeholder="Input Date Length"
    />
  </InputFormItem>
  <InputFormItem>
    <Label for="maxDateLength" class="mb-2">{$_t("Max Date")}</Label>
    <Datepicker
      bind:value={createModel.max}
      id="maxDateLength"
      availableFrom={createModel.min}
      {onchange}
      placeholder="Input Date Length"
    />
  </InputFormItem>
</InputItemsRow>
