<script lang="ts">
  import {
    StringObjectInput,
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
  } from "$components/input";
  import { DestroyModelModal } from "$components/models/destroy";
  import { Toast } from "$components/toasts";
  import { _t, emitEvent, ForwardMapModel, type IForwardMap } from "$lib";
  import { Button, Hr, Input, Label, Textarea } from "flowbite-svelte";
  import { FloppyDiskOutline, TrashBinOutline } from "flowbite-svelte-icons";
  let formEl = $state<HTMLFormElement | null>(null);
  let { forwardMap, onDelete } = $props<{
    forwardMap?: IForwardMap;
    onDelete?: (forwardMap: IForwardMap) => void;
  }>();
  let localForwardMap = $state<Partial<IForwardMap>>(forwardMap || {});

  let validForm = $state(false);
  let creating = $state(false);
  let destroyModal = $state(false);
  const api = new ForwardMapModel();

  const createModel = async () => {
    try {
      creating = true;
      const value = await (localForwardMap.id
        ? api.save(localForwardMap as IForwardMap)
        : api.create(localForwardMap));

      if (!value.id) {
        throw new Error("Failed to create decoder");
      }

      emitEvent<IForwardMap>("forwardMap:created", value);
      if (localForwardMap.id) {
        Toast.success($_t("Decoder updated successfully"));
        localForwardMap = value;
      } else {
        Toast.success($_t("Decoder created successfully"));
        localForwardMap = {};
      }
    } catch (e) {
      console.error("Error creating decoder:", e);
      Toast.error($_t("There was an error creating the decoder"));
    } finally {
      creating = false;
    }
  };
  const onInput = () => {
    validForm = formEl?.checkValidity() || false;
  };
  const onDeleteForwardMap = async () => {
    if (!localForwardMap.id) {
      return;
    }

    try {
      creating = true;
      await api.destroy(localForwardMap);
      onDelete?.(localForwardMap as IForwardMap);
    } catch (e) {
      console.error("Error deleting forward map:", e);
      Toast.error($_t("There was an error deleting the forward map"));
    } finally {
      creating = false;
    }
  };
</script>

<DestroyModelModal
  bind:open={destroyModal}
  onDestroy={onDeleteForwardMap}
  title={$_t("Delete Forward Map")}
  body={$_t("Are you sure you want to delete this forward map?")}
/>

<div class="flex flex-wrap md:flex-nowrap space-x-4">
  <div class="w-full flex flex-col space-y-4 md:w-1/2">
    <form oninput={onInput} bind:this={formEl} class="w-full">
      <InputItemsRow>
        <InputFormItem>
          <RequiredLabel content={"Forward Map Name"} />
          <Input
            required
            disabled={creating}
            bind:value={localForwardMap.name}
          />
        </InputFormItem>
      </InputItemsRow>
      <InputItemsRow>
        <InputFormItem>
          <Label>{$_t("Description")}</Label>
          <Textarea
            bind:value={localForwardMap.description}
            class="w-full"
            disabled={creating}
            placeholder={$_t("A brief description of the forward map")}
          />
        </InputFormItem>
      </InputItemsRow>
    </form>
  </div>
  <div class="w-full md:w-1/2 space-y-4">
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel content={$_t("Key-Value Pairs")} />
        <StringObjectInput
          bind:valid={validForm}
          required
          bind:value={localForwardMap.values}
        />
      </InputFormItem>
    </InputItemsRow>
  </div>
</div>

<div class="flex w-full flex-col">
  <Hr class="my-4" />

  <div class="flex items-center space-x-2 w-full mt-4">
    {#if localForwardMap.id}
      <Button outline color="rose" onclick={() => (destroyModal = true)}
        ><TrashBinOutline /></Button
      >
    {/if}

    <Button
      disabled={!localForwardMap.name ||
        !Object.keys(localForwardMap.values || {}).length ||
        creating ||
        !validForm}
      class="w-full"
      onclick={createModel}
      ><FloppyDiskOutline /> {$_t("Save Forwarder Map")}</Button
    >
  </div>
</div>
