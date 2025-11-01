<script lang="ts">
  import {
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
  } from "$components/input";
  import StringObjectInput from "$components/input/StringObjectInput.svelte";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";
  import {
    SourceRepository,
    _t,
    emitEvent,
    type ISourceRepository,
  } from "$lib";
  import { Button, Hr, Input, Label, Textarea } from "flowbite-svelte";
  import { PlusOutline, TrashBinOutline } from "flowbite-svelte-icons";

  let { repository = $bindable(), onDelete } = $props<{
    repository?: ISourceRepository;
    onDelete?: (prof: ISourceRepository) => void;
  }>();
  const api = new SourceRepository();
  let destroyValueBind = $state(false);
  let savedRepository = $state<Partial<ISourceRepository>>(
    repository || { branch: "main" },
  );
  let saving = $state(false);
  let valid = $state(false);
  let formElement: HTMLFormElement;
  const handleSubmit = async () => {
    try {
      saving = true;
      if (savedRepository.id) {
        savedRepository = await api.save(savedRepository as ISourceRepository);
        emitEvent<ISourceRepository>(
          "repository:created",
          savedRepository as ISourceRepository,
        );
      } else {
        const result = await api.create(savedRepository);
        savedRepository = { branch: "main" };
        emitEvent<ISourceRepository>("repository:created", result);
      }
    } catch (e) {
      console.error("Error saving repository:", e);
    } finally {
      saving = false;
    }
  };
  const handleDestroy = async () => {
    try {
      saving = true;
      await api.destroy(savedRepository as ISourceRepository);
      onDelete?.(savedRepository as ISourceRepository);
      emitEvent<ISourceRepository>(
        "repository:destroyed",
        savedRepository as ISourceRepository,
      );
    } catch (e) {
      console.error("Error destroying repository:", e);
    } finally {
      saving = false;
    }
  };
  const checkValidity = () => {
    valid = formElement?.checkValidity() || false;
  };
</script>

<DestroyModelModal
  bind:open={destroyValueBind}
  onDestroy={handleDestroy}
  title={"Destroy Repository"}
  body={"Are you sure you want to destroy this repository?"}
/>

<form
  bind:this={formElement}
  onsubmit={handleSubmit}
  class="space-y-4"
  oninput={checkValidity}
>
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel content="Repository Name" />
      <Input disabled={saving} bind:value={savedRepository.name} />
    </InputFormItem>
    <InputFormItem>
      <RequiredLabel content="Branch" />
      <Input disabled={saving} bind:value={savedRepository.branch} />
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <RequiredLabel content="Image Name" />
      <Input disabled={saving} bind:value={savedRepository.containerName} />
    </InputFormItem>
    <InputFormItem>
      <RequiredLabel content="Build Path" />
      <Input disabled={saving} bind:value={savedRepository.buildPath} />
    </InputFormItem>
  </InputItemsRow>
  <InputFormItem>
    <RequiredLabel content="Repository URL (generally the ssh url)" />
    <Input disabled={saving} bind:value={savedRepository.url} />
  </InputFormItem>

  <InputFormItem>
    <Label>{$_t("SSH Key (if private)")}</Label>
    <Textarea
      disabled={saving}
      class="w-full"
      bind:value={savedRepository.sshKey}
    />
  </InputFormItem>
  <InputFormItem>
    <Label>{$_t("Meta Parameter")}</Label>
    <StringObjectInput
      onChange={checkValidity}
      disabled={saving}
      bind:value={savedRepository.meta}
    />
  </InputFormItem>
  <Hr class="my-4" />
  <InputItemsRow class="w-full">
    {#if savedRepository.id}
      <Button
        type="button"
        color="rose"
        outline
        disabled={saving}
        onclick={() => (destroyValueBind = true)}><TrashBinOutline /></Button
      >
    {/if}
    <Button class="w-full" type="submit" disabled={!valid || saving}
      ><PlusOutline /> {$_t("Save")}</Button
    >
  </InputItemsRow>
</form>
