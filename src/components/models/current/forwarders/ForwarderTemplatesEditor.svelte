<script lang="ts">
  import {
    _t,
    emitEvent,
    ForwarderTargetKind,
    ForwarderTemplatesModel,
    siteUser,
    type ForwarderTargetTemplates,
    type IForwarderTemplate,
  } from "$lib";
  import { DecoderInput, ParamMapper } from "./inputs";
  import {
    InputItemsRow,
    InputFormItem,
    AvatarBuilder,
  } from "$components/input";
  import RequiredLabel from "$components/input/RequiredLabel.svelte";
  import {
    Accordion,
    AccordionItem,
    Button,
    Heading,
    Helper,
    Hr,
    Input,
    Label,
    P,
    Textarea,
    Toggle,
  } from "flowbite-svelte";
  import {
    ForwardOutline,
    RocketOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import ForwardTemplate from "./inputs/ForwardTemplate.svelte";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";
  let formEl = $state<HTMLFormElement | null>(null);
  let valid = $state(false);
  let saving = $state(false);
  let destroyModal = $state(false);
  let { value = $bindable(), ondestroy } = $props<{
    value?: Partial<IForwarderTemplate>;
    ondestroy?: (val: IForwarderTemplate) => void;
  }>();
  const defaultForwarder = (): Partial<IForwarderTemplate> => {
    return {
      enabled: true,
      retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
      targets: [] as ForwarderTargetTemplates[],
      mapIds: [],
      decoderIds: [],
      owner: $siteUser?.uid,
      topicPattern: "",
      condition: "",
    };
  };
  let template = $state<Partial<IForwarderTemplate>>(
    value || defaultForwarder(),
  );
  const api = new ForwarderTemplatesModel();
  const isValid = () => {
    valid = formEl ? formEl.checkValidity() : false;
  };
  const applyTarget = (target: ForwarderTargetTemplates) => {
    template.targets = template.targets || [];
    template.targets.push(target);
  };

  const addHttp = () => {
    const target: ForwarderTargetTemplates = {
      kind: ForwarderTargetKind.HTTP,
      urlTemplate: "",
      method: "POST",
      headers: [],
      bodyTemplate: [],
    };
    applyTarget(target);
  };
  const addMqtt = () => {
    const target: ForwarderTargetTemplates = {
      kind: ForwarderTargetKind.MQTT,
      topicTemplate: "",
      payloadTemplate: [],
    };
    applyTarget(target);
  };

  const saveTemplate = async () => {
    try {
      saving = true;
      const saved = await (template.id
        ? api.save(template as IForwarderTemplate)
        : api.create(template));
      if (!saved.id) {
        throw new Error("Failed to save template");
      }

      console.log("Saved template", saved);
      valid = false;
      formEl?.reset();
      template = template.id ? saved : defaultForwarder();
      console.log("Reset template", template);

      emitEvent<IForwarderTemplate>("forwardTemplate:created", saved);
    } catch (e) {
      console.error("Error saving template:", e);
    } finally {
      saving = false;
    }
  };

  const destroy = async () => {
    if (!value.id) {
      return;
    }

    try {
      saving = true;
      await api.destroy(value);
      emitEvent<string>("forwardTemplate:deleted", value.id);
      ondestroy && ondestroy(value);
    } catch (e) {
      console.error("Error deleting template:", e);
    } finally {
      saving = false;
    }
  };
</script>

<DestroyModelModal
  bind:open={destroyModal}
  onDestroy={destroy}
  title={$_t("Delete Forward Template")}
  body={$_t(
    "This action will destroy this template. However, any forwarders associated will remain intact.",
  )}
/>

<form bind:this={formEl} onchange={isValid} class="space-y-4 mb-10">
  <InputItemsRow class="items-center">
    <InputFormItem grow>
      <RequiredLabel content={$_t("Template Name")} />
      <Input disabled={saving} bind:value={template.name} />
    </InputFormItem>
    <InputFormItem shrink>
      <Toggle
        disabled={saving}
        bind:checked={template.enabled}
        title={$_t("Enabled")}>{$_t("Enabled")}</Toggle
      >
    </InputFormItem>
    <InputFormItem shrink>
      <AvatarBuilder disabled={saving} bind:avatar={template.avatar} />
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Description")}</Label>
      <Textarea
        class="w-full"
        disabled={saving}
        bind:value={template.description}
      />
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Retry Policy")}</Label>
      <Input
        type="number"
        min={-1}
        disabled={saving}
        bind:value={template.retryPolicy!.maxAttempts}
        placeholder={$_t("Max Attempts")}
      />
      <Helper
        >{$_t(
          "Number of retry attempts for failed forwards. Set to -1 for infinite retries.",
        )}</Helper
      >
    </InputFormItem>
    <InputFormItem>
      <Label>{$_t("Retry Backoff")}</Label>
      <Input
        type="number"
        min={0}
        disabled={saving}
        bind:value={template.retryPolicy!.backoffMs}
        placeholder={$_t("Backoff Time (ms)")}
      />
      <Helper
        >{$_t(
          "Number of milliseconds to wait before retrying a failed forward. ",
        )}</Helper
      >
    </InputFormItem>
  </InputItemsRow>
  <InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Select Conditions")}</Label>
      <Textarea
        class="w-full"
        disabled={saving}
        bind:value={template.condition}
        rows={3}
      />
      <Helper
        >{$_t(
          "User an SQL-like query language to select conditions for forwarding payloads. If empty all payloads will be forwarded",
        )}</Helper
      >
      <code class="text-gray-600 dark:text-gray-200"
        >e.g. {`temperature > 30 AND humidity < 60 AND status IN ["ok", "ready"]`}</code
      >
    </InputFormItem>
  </InputItemsRow>

  <InputItemsRow>
    <InputFormItem>
      <Label
        >{$_t("Decoders")}
        <small>{$_t("Order matters. Decoders cascade output.")}</small></Label
      >
      <DecoderInput
        onChange={() => isValid()}
        disabled={saving}
        bind:value={template.decoderIds}
      />
    </InputFormItem>

    <InputFormItem>
      <Label>{$_t("Param Mapping")}</Label>
      <ParamMapper
        onChange={() => isValid()}
        disabled={saving}
        bind:value={template.mapIds}
      />
    </InputFormItem>

    <InputFormItem>
      <Label
        >{$_t("Transformers")}
        <small>{$_t("Decoders after parameter mapping")}</small></Label
      >
      <DecoderInput
        onChange={() => isValid()}
        disabled={saving}
        bind:value={template.transformerIds}
      />
    </InputFormItem>
  </InputItemsRow>
  <InputFormItem>
    <P>{$_t("Forwarding Targets ")}</P>
    <InputItemsRow>
      <Accordion flush>
        {#each template.targets || [] as target, index}
          <AccordionItem>
            {#snippet header()}
              <div class="flex pr-8 items-center w-full">
                <Heading tag="h5"
                  >{`${target.kind} Target ${index + 1}`}</Heading
                >
                <Button
                  outline
                  pill
                  type="button"
                  color="red"
                  size="xs"
                  class="ml-auto"
                  onclick={() => template.targets!.splice(index, 1)}
                  ><TrashBinOutline /></Button
                >
              </div>
            {/snippet}
            <ForwardTemplate
              disabled={saving}
              bind:value={template.targets![index]}
            />
          </AccordionItem>
        {/each}
      </Accordion>
    </InputItemsRow>
    <P italic
      >{$_t(
        "Note: HTTP forwarding targets will use the artifacts from the response as the payload to the next request (including to the MQTT targets). Create a new template if this is not the expected behavior",
      )}</P
    >
  </InputFormItem>
  <InputFormItem>
    <Hr class="my-4" />
    <InputItemsRow>
      <Button disabled={saving} onclick={() => addHttp()} outline
        ><RocketOutline /> {$_t("HTTP Target")}</Button
      >
      <Button disabled={saving} onclick={() => addMqtt()} color="blue" outline
        ><ForwardOutline /> {$_t("MQTT Target")}</Button
      >
    </InputItemsRow></InputFormItem
  >

  <div class="w-full flex flex-col mb-6">
    <Hr class="my-4" />
    <div class="flex space-x-4 w-full mt-4">
      {#if template.id}
        <Button
          disabled={saving}
          color="red"
          onclick={() => (destroyModal = true)}><TrashBinOutline /></Button
        >
      {/if}
      <Button
        onclick={saveTemplate}
        type="button"
        disabled={!valid || saving}
        class="w-full">{$_t("Save Template")}</Button
      >
    </div>
  </div>
</form>
