<script lang="ts">
  import {
    _t,
    emitEvent,
    ForwardersModel,
    ForwarderTargetKind,
    generateUniqueUUID,
    type HttpTarget,
    type HttpTargetTemplate,
    type IForwarders,
    type IForwarderTemplate,
    type MqttTarget,
    type MqttTargetTemplate,
    ParameterValueOwnerBy,
    siteUser,
    UserRoles,
    type UUID,
  } from "$lib";
  import {
    Button,
    Card,
    Heading,
    Helper,
    Hr,
    Input,
    P,
    Toggle,
  } from "flowbite-svelte";
  import ForwardTemplateSelectionRows from "./ForwardTemplateSelectionRows.svelte";
  import {
    RequiredLabel,
    InputItemsRow,
    InputFormItem,
  } from "$components/input";
  import UserAvatar from "$components/user/UserAvatar.svelte";
  import SecretParamInputs from "./inputs/SecretParamInputs.svelte";
  import { FloppyDiskOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import { Toast } from "$components/toasts";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";

  let {
    value = $bindable(),
    owner,
    ownedBy = ParameterValueOwnerBy.SYSTEM,
    ownerName,
    order = 0,
    onDelete,
  } = $props<{
    value?: IForwarders;
    owner?: UUID;
    ownedBy?: ParameterValueOwnerBy;
    ownerName?: string;
    order?: number;
    onDelete?: (forwarder: IForwarders) => void;
  }>();
  let valid = $state(false);
  let formEl = $state<HTMLFormElement | null>(null);
  let saving = $state(false);
  let destroyModal = $state(false);
  const api = new ForwardersModel();
  let readyValues = $state<Record<string, boolean>>({});
  const setDefault = () => {
    return {
      enabled: true,
      owner,
      ownedBy,
      uid: generateUniqueUUID(),
      creator: $siteUser?.uid,
      order,
    };
  };
  let editForwarder = $state<Partial<IForwarders & { uid?: UUID }>>(
    value || setDefault(),
  );
  let selectedTemplate = $state<IForwarderTemplate | undefined>();
  let validateForm = () => {
    for (const key in readyValues) {
      if (!readyValues[key]) {
        valid = false;
        return;
      }
    }
    valid = formEl?.checkValidity() || false;
  };

  const setSecretParams = () => {
    if (!selectedTemplate) {
      editForwarder.targets = [];
      //   secretParams = [];
      return;
    }

    editForwarder.targets = selectedTemplate.targets.map((t) => {
      const newTarget: any = { ...t };
      if (t.kind === ForwarderTargetKind.MQTT) {
        newTarget.payloadTemplate = [];
      } else if (t.kind === ForwarderTargetKind.HTTP) {
        newTarget.headers = [];
        newTarget.bodyTemplate = [];
      }
      return newTarget;
    });
  };

  const onSelectLocal = (template: IForwarderTemplate) => {
    selectedTemplate = template;

    if (editForwarder.template === template.id) {
      return;
    }

    editForwarder.template = template.id as UUID;
    editForwarder.name = `${template.name} - ${ownerName || "New Forwarder"}`;
    setSecretParams();
    setTimeout(validateForm, 300);
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (!valid || !selectedTemplate) {
      return;
    }
    try {
      saving = true;
      if (editForwarder.id) {
        editForwarder = await api.save(editForwarder as IForwarders);
        emitEvent<IForwarders>(
          "forwarder:created",
          editForwarder as IForwarders,
        );
        Toast.success("Forwarder Saved");
      } else {
        editForwarder.id = editForwarder.uid;
        // syncToTemplate();
        delete editForwarder.uid;
        const results = await api.create(editForwarder as IForwarders);
        emitEvent<IForwarders>("forwarder:created", results);
        editForwarder = setDefault();
        Toast.success("Forwarder Created");
      }
      valid = false;
      formEl?.reset();
    } catch (error) {
      console.error("Error saving forwarder:", error);
    } finally {
      saving = false;
    }
  };

  const destroyForwarder = async () => {
    if (!editForwarder.id) {
      return;
    }
    try {
      await api.destroy(editForwarder);
      emitEvent<IForwarders>("forwarder:deleted", editForwarder as IForwarders);
      onDelete?.(editForwarder as IForwarders);
      destroyModal = false;
      Toast.success("Forwarder Deleted");
    } catch (error) {
      console.error("Error deleting forwarder:", error);
    }
  };

  let isAdmin = $derived($siteUser && $siteUser.role > UserRoles.MANAGER);
</script>

<DestroyModelModal
  bind:open={destroyModal}
  title={"Destroy Forwarder " + (editForwarder.name || "")}
  onDestroy={destroyForwarder}
  body="You can simply disabled the forwarder to stop the integration activity"
/>

<form
  bind:this={formEl}
  class="space-y-4"
  onsubmit={onSubmit}
  oninput={validateForm}
>
  <ForwardTemplateSelectionRows
    selected={editForwarder.template}
    onSelect={onSelectLocal}
    hideOnSelected
  />
  {#if selectedTemplate}
    <InputItemsRow>
      <InputFormItem>
        {#if selectedTemplate}
          <div class="flex flex-col items-center- space-y-2">
            <div class="flex items-center space-x-2">
              <UserAvatar avatar={selectedTemplate.avatar} size="sm" />
              {#if !editForwarder.id && isAdmin}
                <Button
                  color="rose"
                  outline
                  pill
                  disabled={saving}
                  size="xs"
                  onclick={() => {
                    selectedTemplate = undefined;
                    editForwarder.template = undefined;
                    setSecretParams();
                    validateForm();
                  }}>{$_t("Change Template")}</Button
                >
              {/if}
            </div>
            <P>{selectedTemplate.name}</P>
          </div>
        {:else}
          <P class="text-center">{$_t("No Template Selected")}</P>
        {/if}
      </InputFormItem>
      <InputFormItem>
        <Toggle
          disabled={saving}
          class="ml-auto"
          bind:checked={editForwarder.enabled}>{$_t("Enabled")}</Toggle
        >
      </InputFormItem>
    </InputItemsRow>
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel content="Forwarder Name" />
        <Input disabled={saving} bind:value={editForwarder.name} required />
      </InputFormItem>
      <InputFormItem>
        <RequiredLabel content="Topic Pattern" />
        <Input
          disabled={saving}
          bind:value={editForwarder.topicPattern}
          required
        />
        <Helper
          >{$_t(
            "The topic pattern to match messages. You can use MQTT wildcards like + and #.",
          )}</Helper
        >
      </InputFormItem>
    </InputItemsRow>

    <InputItemsRow>
      {#if editForwarder && editForwarder.targets}
        {#each editForwarder.targets as target, tIdx}
          {@const targetTemplate = selectedTemplate?.targets[tIdx]}
          {#if targetTemplate}
            <InputFormItem class="space-y-2">
              <Heading tag="h3" class="font-bold">
                {$_t("Target")}
                {tIdx + 1}: {target.kind}
              </Heading>
              {#if target.kind === ForwarderTargetKind.MQTT}
                {@const mqttTarget = target as MqttTarget}
                {@const mqttTemplate = targetTemplate as MqttTargetTemplate}
                {@const templateParams = mqttTemplate.payloadTemplate || []}
                {#if templateParams.length === 0}
                  <Card class="p-2  dark:bg-gray-950">
                    <P class="text-center"
                      >{$_t("No body parameters required for this target.")}</P
                    >
                  </Card>
                {:else}
                  <Heading tag="h6"
                    >{$_t("Payload Template Parameters")}</Heading
                  >
                  <SecretParamInputs
                    keys={templateParams}
                    name="MQTT Payload"
                    disabled={saving}
                    editable={isAdmin}
                    bind:valid={readyValues[`target_${tIdx}_mqtt_payload`]}
                    ownedBy={ParameterValueOwnerBy.INTEGRATION}
                    owner={(editForwarder.id as UUID) || editForwarder.uid}
                    onChange={() => validateForm()}
                    bind:value={mqttTarget.payloadTemplate as UUID[]}
                  />
                {/if}
              {:else if target.kind === ForwarderTargetKind.HTTP}
                {@const httpTarget = target as HttpTarget}
                {@const httpTemplate = targetTemplate as HttpTargetTemplate}
                {@const templateHeaders = httpTemplate.headers || []}
                {@const templateBody = httpTemplate.bodyTemplate || []}

                {#if templateHeaders.length === 0}
                  <Card class="p-2  dark:bg-gray-950">
                    <P class="text-center"
                      >{$_t(
                        "No header parameters required for this target.",
                      )}</P
                    >
                  </Card>
                {:else}
                  <Heading tag="h6">{$_t("Header Template Parameters")}</Heading
                  >
                  <SecretParamInputs
                    keys={httpTemplate.headers || []}
                    name="HTTP Headers"
                    disabled={saving}
                    editable={isAdmin}
                    bind:valid={readyValues[`target_${tIdx}_http_headers`]}
                    ownedBy={ParameterValueOwnerBy.INTEGRATION}
                    onChange={() => validateForm()}
                    owner={(editForwarder.id as UUID) || editForwarder.uid}
                    bind:value={httpTarget.headers as UUID[]}
                  />
                {/if}
                {#if templateBody.length === 0}
                  <Card class=" p-2  dark:bg-gray-950">
                    <P class="text-center"
                      >{$_t("No body parameters required for this target.")}</P
                    >
                  </Card>
                {:else}
                  <Heading tag="h6">{$_t("Body Template Parameters")}</Heading>
                  <SecretParamInputs
                    keys={httpTemplate.bodyTemplate || []}
                    name="HTTP Body"
                    disabled={saving}
                    editable={isAdmin}
                    bind:valid={readyValues[`target_${tIdx}_http_body`]}
                    ownedBy={ParameterValueOwnerBy.INTEGRATION}
                    onChange={() => validateForm()}
                    owner={(editForwarder.id as UUID) || editForwarder.uid}
                    bind:value={httpTarget.bodyTemplate as UUID[]}
                  />
                {/if}
              {/if}
            </InputFormItem>
          {/if}
        {/each}
      {/if}
    </InputItemsRow>
    {#if $siteUser && $siteUser.role > UserRoles.MANAGER}
      <div class="w-full flex flex-col">
        <Hr />
        <InputItemsRow>
          {#if editForwarder.id}
            <Button
              disabled={saving}
              onclick={() => (destroyModal = true)}
              type="button"
              outline
              color="rose"><TrashBinOutline /></Button
            >
          {/if}
          <Button type="submit" class="w-full" disabled={!valid || saving}
            ><FloppyDiskOutline /> {$_t("Save Forwarder")}</Button
          >
        </InputItemsRow>
      </div>
    {/if}
  {/if}
</form>
