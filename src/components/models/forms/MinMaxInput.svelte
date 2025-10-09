<script lang="ts">
  import { _t, type FormModelValue } from "$lib";

  import { Label, Input } from "flowbite-svelte";
  import { InputItemsRow, InputFormItem } from "$components";
  let { createModel = $bindable(), onchange } = $props<{
    createModel: Partial<FormModelValue>;
    onchange?: () => void;
  }>();
</script>

<InputItemsRow>
  <InputFormItem>
    <Label for="minLength" class="mb-2">{$_t("Min")}</Label>
    <Input
      type="number"
      bind:value={createModel.min}
      id="minLength"
      min={0}
      max={createModel.max}
      step="1"
      {onchange}
      placeholder="Input Min Length"
    />
  </InputFormItem>
  <InputFormItem>
    <Label for="maxLength" class="mb-2">{$_t("Max")}</Label>
    <Input
      type="number"
      bind:value={createModel.max}
      id="maxLength"
      min={createModel.min}
      step="1"
      {onchange}
      placeholder="Input Max Length"
    />
  </InputFormItem>
</InputItemsRow>
