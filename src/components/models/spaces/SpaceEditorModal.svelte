<script lang="ts">
  import {
    type CourseWithRegistration,
    SpacesApi,
    type SpacesModel,
    _t,
  } from "$lib";
  import { Modal, Button } from "flowbite-svelte";
  import { PlanStep1 } from "./steps";
  const api = new SpacesApi();
  let {
    model = $bindable(),
    open = $bindable(false),
    onEdit,
  } = $props<{
    model: SpacesModel | CourseWithRegistration;
    open: boolean;
    onEdit: (plan: SpacesModel | CourseWithRegistration) => void;
  }>();
  let isDisabled = $state(true);
  let isDirty = $state(false);
  let loading = $state(false);
  let updatedModel = $state<SpacesModel>({ ...model });
  const setForm = () => {
    isDirty = true;
  };

  const stripModel = () => {
    const localModel: Partial<SpacesModel> = { ...updatedModel };
    const remove = ["uid", "created_at", "updated_at", "restriction"];
    for (const value of remove) {
      delete localModel[value as keyof SpacesModel];
    }
    return localModel;
  };
  const sendUpdate = async () => {
    loading = true;
    try {
      const update = await api.update(stripModel(), { uid: model.uid });
      const updated = Array.isArray(update) ? update.pop() : update;
      model = updated;
      updatedModel = { ...model };
      onEdit && onEdit(updated);
      isDirty = false;
    } catch (e) {
      console.log("Error Updating Plan", e);
    } finally {
      loading = false;
    }
  };
</script>

<Modal title="Space Editor" bind:open outsideclose={false} size="xl">
  <PlanStep1
    bind:model={updatedModel}
    bind:disableNext={isDisabled}
    formChange={setForm}
  />

  {#snippet footer()}
    <div class="flex w-full">
      <Button
        class="ml-auto"
        disabled={isDisabled || !isDirty || loading}
        onclick={sendUpdate}
      >
        {$_t("Save")}
      </Button>
    </div>
  {/snippet}
</Modal>
