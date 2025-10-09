<script lang="ts">
  import { FormApi, _t, type FormModel, type FormModelValue } from "$lib";
  import { Button, Hr, Input } from "flowbite-svelte";
  import FormOptions from "./FormOptions.svelte";
  import FormFieldCreateElementModal from "./FormFieldCreateElementModal.svelte";
  import CaretDown from "@tabler/icons-svelte/icons/caret-down";
  import CaretUp from "@tabler/icons-svelte/icons/caret-up";
  import {
    EditOutline,
    PlusOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import {
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
    DynamicForm2,
    Toast,
    UserRoleSelect,
  } from "$components";

  let { onAction, model = {} } = $props<{
    onAction: (model: FormModel) => void;
    model?: FormModel;
  }>();
  let formModel = $state<Partial<FormModel>>(model);
  let formElements = $state<FormModelValue[]>(model?.form || []);
  let disabledControls = $state(false);
  let fieldEditor = $state<FormModelValue | null>(null);
  let openFieldEditor = $state(false);
  let dirty = $state(false);
  const api = new FormApi();
  /**
   * Our weight values dictate the order of our elements. We need a way to re-weight the elements that come after the one being edited.
   * and then append the values to the
   *
   */
  const sortValues = (values: FormModelValue[]) => {
    values.sort((a, b) => {
      if (a.weight && b.weight) {
        return a.weight - b.weight;
      }
      return 0;
    });
    return values;
  };
  const reWeight = (element: FormModelValue, values: FormModelValue[]) => {
    sortValues(values);
    const setWeight = element.weight || 0;
    const currentLength = values.length;
    if (setWeight >= currentLength) {
      values.push(element);
      return values;
    }
    for (let i = 0; i < currentLength; i++) {
      const value = values[i];
      value.weight = i + (i < setWeight ? 0 : 1);
    }
    values.splice(setWeight, 0, element);
    return values;
  };
  const onAdd = (element: FormModelValue) => {
    dirty = true;
    const values = $state.snapshot<FormModelValue[]>([...formElements]);
    formElements = [];
    setTimeout(() => {
      formElements = reWeight(element, values as FormModelValue[]);
      disabledControls = false;
    }, 100);
  };

  const shiftElement = (_: FormModelValue, index: number, up = false) => {
    disabledControls = true;
    const length = formElements.length;
    const elements = formElements.splice(index, 1);
    const el = $state.snapshot(elements[0]);
    el.weight = up ? el.weight - 1 : el.weight + 1;
    if (el.weight < 0) {
      el.weight = 0;
    } else if (el.weight >= length) {
      el.weight = length - 1;
    }
    onAdd(el as FormModelValue);
  };
  let loading = $state(false);
  const sendUpdate = async () => {
    const formValues = $state.snapshot(formElements);
    formModel.form = formValues as FormModelValue[];
    try {
      loading = true;
      const update = await (formModel.uid
        ? api.update(
            {
              form: formModel.form,
              name: formModel.name,
              role: formModel.role,
            },
            { uid: formModel.uid },
          )
        : api.create(formModel));
      onAction(update);
      dirty = false;
    } catch (e) {
      console.error("Error updating form :", e);
      Toast.error("Failed to save form");
    } finally {
      loading = false;
    }
  };
  const removeElement = (index: number) => {
    disabledControls = true;
    dirty = true;
    const values = [...$state.snapshot(formElements)];
    values.splice(index, 1);
    for (let i = 0; i < values.length; i++) {
      const el = values[i];
      el.weight = i;
    }
    formElements = [];
    setTimeout(() => {
      formElements = values as FormModelValue[];
      disabledControls = false;
    }, 100);
  };
  const setEdit = (index: number) => {
    fieldEditor = $state.snapshot(formElements[index]);
    openFieldEditor = true;
  };
  const alterValues = (model: FormModelValue) => {
    disabledControls = true;
    openFieldEditor = false;
    dirty = true;
    const values = [...$state.snapshot(formElements)];
    const index = values.findIndex((el) => el.name === model.name);
    if (index !== -1) {
      values.splice(index, 1);
      values.splice(index, 0, model as FormModelValue);
    }
    formElements = [];
    setTimeout(() => {
      formElements = values as FormModelValue[];
      disabledControls = false;
    }, 100);
  };
</script>

{#if fieldEditor}
  <FormFieldCreateElementModal
    bind:open={openFieldEditor}
    model={fieldEditor}
    oncancel={() => (fieldEditor = null)}
    onCreate={alterValues}
  />
{/if}

<div class="flex content-center w-full">
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel for="__form_name__" content="Form Name" />
      <Input
        type="text"
        bind:value={formModel.name}
        id="__form_name__"
        placeholder="Form Name"
        required
        onchange={() => (dirty = true)}
      />
    </InputFormItem>

    <InputFormItem>
      <UserRoleSelect
        oninput={() => (dirty = true)}
        id="__role_select__"
        bind:model={formModel.role}
      />
    </InputFormItem>
  </InputItemsRow>
</div>
<Hr />
<div class="flex items-center- w-full space-x-4">
  <FormOptions {onAdd} {formElements} length={formElements.length} />
  <div class="w-full">
    {#if formElements.length}
      <DynamicForm2 hideControls {model} fields={formElements}>
        {#snippet controls(formElement: FormModelValue, index: number)}
          <Button
            onclick={() => removeElement(index)}
            class="p-1"
            color={"red"}
            disabled={disabledControls}
            size="xs"><TrashBinOutline size={"xs"} /></Button
          >

          <div class="flex space-x-2 ml-auto">
            <Button
              onclick={() => setEdit(index)}
              class="p-1"
              color={"alternative"}
              disabled={disabledControls}
              size="xs"><EditOutline size={"xs"} /></Button
            >

            {#if index > 0}
              <Button
                onclick={() => shiftElement(formElement, index, true)}
                class="p-1"
                disabled={disabledControls}
                size="xs"><CaretUp size={14} /></Button
              >
            {/if}
            {#if index < formElements.length - 1}
              <Button
                onclick={() => shiftElement(formElement, index)}
                class="p-1"
                disabled={disabledControls}
                size="xs"><CaretDown size={14} /></Button
              >
            {/if}
          </div>
        {/snippet}
      </DynamicForm2>
    {/if}
  </div>
</div>
<Hr />

<div class="flex content-center w-full mb-16">
  <Button
    class="ml-auto"
    onclick={() => sendUpdate()}
    disabled={!formElements.length ||
      loading ||
      !formModel.name ||
      !formModel.role ||
      !dirty}
  >
    <PlusOutline />
    {formModel.uid ? $_t("Update Form") : $_t("Create Form")}
  </Button>
</div>
