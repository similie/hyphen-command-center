<script lang="ts">
  import {
    InputItemsRow,
    InputFormItem,
    RequiredLabel,
    UserRoleSelect,
  } from "$components/input";
  import {
    _t,
    FormApplicationApi,
    type ApplicationModel,
    type FormModel,
    type UUID,
  } from "$lib";
  import { Button, Heading, Hr, Input } from "flowbite-svelte";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import FormFinderModal from "../FormFinderModal.svelte";
  import CaretDown from "@tabler/icons-svelte/icons/caret-down";
  import CaretUp from "@tabler/icons-svelte/icons/caret-up";
  import { Toast } from "$components/toasts";

  let { onAction, model } = $props<{
    onAction: (application: ApplicationModel) => void;
    model?: ApplicationModel;
  }>();

  const applyFilter = () => {
    if (!model || !model.forms) {
      return [];
    }
    return model.forms.map((form: FormModel) => form.uid);
  };
  const api = new FormApplicationApi();
  let formModel = $state<Partial<ApplicationModel>>(model || {});
  let forms = $state<FormModel[]>(model?.forms || []);
  let dirty = $state(false);
  let formFilter = $state<UUID[]>(applyFilter());
  let formFinder = $state(false);
  let saving = $state(false);

  const remove = (form: FormModel) => {
    dirty = true;
    forms = forms.filter((f: FormModel) => f.uid !== form.uid);
    formFilter = formFilter.filter((f: UUID) => f !== form.uid);
  };
  const onSelect = (form: FormModel) => {
    dirty = true;
    formFinder = false;
    forms = [...forms, form];
    formFilter.push(form.uid);
  };

  const changePosition = (index: number, up = false) => {
    dirty = true;
    const formsCopy = [...forms];
    const targetIndex = up ? index - 1 : index + 1;
    const splits = formsCopy.splice(index, 1);
    formsCopy.splice(targetIndex, 0, splits[0]);
    forms = formsCopy;
  };

  const saveApplication = async () => {
    try {
      saving = true;
      dirty = false;
      const saveModel = { ...formModel, forms: forms.map((f) => f.uid) };
      const action =
        model && model.uid
          ? api.update(saveModel, { uid: model.uid })
          : api.create(saveModel);
      const saved = await action;
      const sendModel = { ...saved, forms };
      if (!model || !model.uid) {
        formModel = {};
      }
      onAction(sendModel);
      Toast.success("Application model saved successfully");
    } catch (e) {
      console.error("Error creating application model", e);
      Toast.error("Failed to create application model");
    } finally {
      saving = false;
    }
  };
</script>

{#if formFinder}
  <FormFinderModal
    filter={formFilter}
    bind:open={formFinder}
    role={formModel.role!}
    {onSelect}
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
        placeholder="Application Name"
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
<div class="flex flex-col w-full">
  {#each forms as form, i}
    <div
      class="flex items-center w-full dark:bg-gray-600 bg-gray-200 p-4 mb-2 rounded-xl"
    >
      <Heading tag="h5">{form.name}</Heading>
      <div class="ml-auto flex items-center space-x-2">
        {#if i > 0}
          <Button
            onclick={() => changePosition(i, true)}
            size="xs"
            type="button"
          >
            <CaretUp size="12" />
          </Button>
        {/if}

        {#if i < forms.length - 1}
          <Button onclick={() => changePosition(i)} size="xs" type="button">
            <CaretDown size="12" />
          </Button>
        {/if}

        <Button
          type="button"
          color="rose"
          size="xs"
          onclick={() => remove(form)}
        >
          <TrashBinOutline size={"xs"} />
        </Button>
      </div>
    </div>
  {/each}
</div>

<Button type="button" onclick={() => (formFinder = true)}>
  <PlusOutline />
</Button>
<Hr />
<div class="flex w-full">
  <Button
    class="ml-auto"
    disabled={!dirty || !formModel.name || !forms.length || saving}
    onclick={saveApplication}
  >
    <PlusOutline />
    {$_t("Save Application")}
  </Button>
</div>
