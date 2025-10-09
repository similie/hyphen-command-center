<script lang="ts">
  import {
    generateUniqueUUID,
    _t,
    FormTypeEnum,
    type FormModelValue,
    type FormValueModel,
    Debounce,
    UserRoles,
  } from "$lib";

  import {
    Label,
    Modal,
    Input,
    Hr,
    Checkbox,
    Toggle,
    Button,
    Select,
  } from "flowbite-svelte";
  import {
    RequiredLabel,
    InputItemsRow,
    InputFormItem,
    DynamicForm2,
    SelectAllocation,
    Toast,
    FileTypesAcceptedInput,
  } from "$components";
  import MinMaxInput from "./MinMaxInput.svelte";
  import { onMount } from "svelte";
  import MinMaxDate from "./MinMaxDate.svelte";
  import DateLocal from "./DateLocal.svelte";

  let {
    open = $bindable(),
    createField,
    model,
    oncancel,
    onCreate,
    length,
  } = $props<{
    open?: boolean;
    createField?: FormValueModel;
    model?: FormModelValue;
    oncancel: () => void;
    onCreate: (model: FormModelValue, index?: number) => void;
    length?: number;
  }>();
  let dirty = $state(false);

  if (!createField && !model) {
    open = false;
    Toast.error("Invalid field or model");
  }

  const getType = () => {
    if (createField) {
      return createField.type;
    }
    if (model) {
      return model.type;
    }
    throw new Error("Invalid type selected");
  };

  const applySpecificOptions = () => {
    let value = null;
    let selectOptions = undefined;
    const name = generateUniqueUUID();
    const type = getType();
    if (
      type === FormTypeEnum.TEXT ||
      type === FormTypeEnum.TEXT_AREA ||
      type === FormTypeEnum.EMAIL
    ) {
      value = "";
    } else if (type === FormTypeEnum.NUMBER) {
      value = null;
    } else if (type === FormTypeEnum.CHECKBOX) {
      value = false;
    } else if (type === FormTypeEnum.STRING_ARRAY) {
      value = [];
    } else if (type === FormTypeEnum.RECORDS) {
      value = {};
    } else if (type === FormTypeEnum.ROLE) {
      value = UserRoles.USER;
    } else if (type === FormTypeEnum.SELECT) {
      value = "";
      selectOptions = [];
    } else if (type === FormTypeEnum.RADIO) {
      value = "";
      selectOptions = [];
    } else if (type === FormTypeEnum.CHECK_GROUP) {
      value = [];
      selectOptions = [];
    }
    return { value, selectOptions, type, name };
  };
  const newModel = () => {
    const { value, selectOptions, type, name } = applySpecificOptions();
    return {
      name,
      type,
      required: false,
      value,
      selectOptions,
      weight: length,
    };
  };
  const bounce = new Debounce();
  let createModel = $state<Partial<FormModelValue>>(model || newModel());
  let textvalues = $state<FormModelValue[]>([]);
  let localModel = $state(model || {});
  const updateValues = bounce.bounce(() => {
    dirty = true;
    textvalues = [];
    setTimeout(() => {
      textvalues = [createModel as FormModelValue];
    }, 50);
  }, 50);
  let weightValues = $state<{ value: number; name: string }[]>([]);
  onMount(() => {
    if (model) {
      return updateValues();
    }
    if (length === undefined) {
      return;
    }
    weightValues = Array.from({ length: length + 1 }, (_, i) => ({
      value: i,
      name: `${$_t("Position")} ${i + 1}`,
    }));
  });
</script>

<Modal
  outsideclose={false}
  {oncancel}
  title={createField?.name
    ? `Create a ${createField?.name} Element`
    : `Edit ${model?.label} Element`}
  bind:open
>
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel for="label" content="Label" />
      <Input
        type="text"
        bind:value={createModel.label}
        id="label"
        placeholder="Input Label"
        required
        onchange={updateValues}
      />
    </InputFormItem>

    <InputFormItem>
      <Label class="mb-1">{$_t("Required")}</Label>
      <Checkbox
        bind:checked={createModel.required}
        id="required"
        onchange={updateValues}
      />
    </InputFormItem>
  </InputItemsRow>
  {#if createModel.type === FormTypeEnum.TEXT_AREA}
    <!---->
  {:else if createModel.type === FormTypeEnum.TEXT}
    <InputItemsRow>
      <InputFormItem>
        <Label for="placeholder">{$_t("Placeholder")}</Label>
        <Input
          type="text"
          bind:value={createModel.placeholder}
          id="placeholder"
          placeholder="Input Placeholder"
          onchange={updateValues}
        />
      </InputFormItem>
      <InputFormItem>
        <Label for="patter">{$_t("Pattern")}</Label>
        <Input
          type="text"
          bind:value={createModel.pattern}
          id="pattern"
          placeholder="Input Pattern"
          onchange={updateValues}
        />
      </InputFormItem>
    </InputItemsRow>

    <MinMaxInput bind:createModel onchange={updateValues} />
  {:else if createModel.type === FormTypeEnum.NUMBER}
    <!---->
    <InputItemsRow>
      <InputFormItem>
        <Label for="steps">{$_t("Steps")}</Label>
        <Input
          type="number"
          bind:value={createModel.steps}
          id="steps"
          min="0"
          placeholder="Input Steps"
          onchange={updateValues}
        />
      </InputFormItem>
      <InputFormItem>
        <Label for="defV">{$_t("Default Value")}</Label>
        <Input
          type="number"
          bind:value={createModel.value}
          id="defV"
          min={createModel.min as number | undefined}
          max={createModel.max as number | undefined}
          placeholder="Default Value"
          onchange={updateValues}
        />
      </InputFormItem>
    </InputItemsRow>
    <MinMaxInput bind:createModel onchange={updateValues} />
  {:else if createModel.type === FormTypeEnum.EMAIL}
    <!---->
  {:else if createModel.type === FormTypeEnum.CHECKBOX}
    <!---->
    <InputFormItem>
      <Label for="defV">{$_t("Default Value")}</Label>
      <Toggle bind:checked={createModel.value} id="defV" />
      <!-- <Checkbox bind:checked={createModel.value} id="defV" /> -->
    </InputFormItem>
  {:else if createModel.type === FormTypeEnum.RECORDS}
    <!---->
  {:else if createModel.type === FormTypeEnum.SELECT}
    <!---->
    <SelectAllocation
      bind:selectOption={createModel.selectOptions!}
      required={createModel.required}
    />
  {:else if createModel.type === FormTypeEnum.CHECK_GROUP}
    <SelectAllocation
      bind:selectOption={createModel.selectOptions!}
      required={createModel.required}
      noEmpty
    />
  {:else if createModel.type === FormTypeEnum.RADIO}
    <!-- HERE -->
    <SelectAllocation
      bind:selectOption={createModel.selectOptions!}
      required={createModel.required}
      noEmpty
    />
  {:else if createModel.type === FormTypeEnum.ROLE}
    <!---->
  {:else if createModel.type === FormTypeEnum.STRING_ARRAY}
    <!---->
  {:else if createModel.type === FormTypeEnum.DATE}
    <MinMaxDate bind:createModel onchange={updateValues} />
    <InputFormItem>
      <DateLocal bind:value={createModel.locale} />
    </InputFormItem>
  {:else if createModel.type === FormTypeEnum.FILE_UPLOAD}
    <InputItemsRow>
      <InputFormItem>
        <Label for="maxFileSize"
          >{$_t("Max File Size (MB)")}&nbsp;<small
            >{$_t("Leave empty for no limit")}</small
          ></Label
        >
        <Input
          type="number"
          bind:value={createModel.max as number | undefined}
          id="maxFileSize"
          min="1"
          placeholder="Max File Size in MB"
          onchange={updateValues}
        />
      </InputFormItem>
      <InputFormItem>
        <Label for="multipleFiles">{$_t("Multiple Files")}</Label>
        <Toggle
          onchange={updateValues}
          bind:checked={createModel.multiple}
          id="multipleFiles"
        />
      </InputFormItem>
    </InputItemsRow>
    <InputItemsRow>
      <InputFormItem>
        <Label for="acceptedFiles">{$_t("File Types")}</Label>
        <FileTypesAcceptedInput
          id="acceptedFiles"
          onchange={() => updateValues()}
          bind:value={createModel.accept}
        />
      </InputFormItem>
    </InputItemsRow>
  {:else if createModel.type === FormTypeEnum.RICH_TEXT}
    <MinMaxInput bind:createModel onchange={updateValues} />
  {/if}

  <InputItemsRow>
    <div class="p-4 pl-6 pr-6 w-full">
      <Hr />
      {#if textvalues.length > 0}
        <DynamicForm2
          cols={1}
          edit={true}
          hideControls
          model={localModel}
          fields={textvalues}
        />
      {:else}
        <div class="h-6"></div>
      {/if}
    </div>
  </InputItemsRow>

  {#snippet footer()}
    <div class="flex content-center w-full">
      {#if length !== undefined}
        <Select
          items={weightValues}
          bind:value={createModel.weight}
          id="weight"
        />
      {/if}
      <Button
        disabled={!dirty || !createModel.name || !createModel.label}
        class="ml-auto"
        onclick={() => onCreate($state.snapshot(createModel))}
        type="submit">{$_t(model ? "Update" : "Create")}</Button
      >
    </div>
  {/snippet}
</Modal>
