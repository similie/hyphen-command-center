<script lang="ts">
  import {
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
  } from "$components/input";
  import { _t } from "$lib";
  import { Button, Hr, Input, Spinner, Textarea } from "flowbite-svelte";
  import { PaperPlaneOutline } from "flowbite-svelte-icons";
  type MQTTEvent = {
    topic: string;
    data: string;
  };
  let { onSent } = $props<{ onSent: (data: MQTTEvent) => void }>();
  let loading = $state(false);
  let formEl = $state<HTMLFormElement | undefined>(undefined);
  let event = $state<MQTTEvent>({ topic: "", data: "" });
  const onSubmit = () => {
    loading = true;
    try {
      console.log("Sending event", event);
      onSent && onSent(event);
      event = { topic: "", data: "" };
      formEl?.reset();
    } catch (e) {
      console.error("Failed to send event", e);
    } finally {
      loading = false;
    }
  };

  let validState = $state(false);
  const onInput = () => {
    validState = formEl?.checkValidity() ?? false;
  };
</script>

{#if loading}
  <div class="flex justify-center items-center">
    <Spinner size="6" />
  </div>
{:else}
  <form oninput={onInput} onsubmit={onSubmit} bind:this={formEl}>
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel content={$_t("Topic")}></RequiredLabel>
        <Input bind:value={event.topic} required />
      </InputFormItem>
    </InputItemsRow>
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel content={$_t("Data")}></RequiredLabel>
        <Textarea bind:value={event.data} required class="w-full" />
      </InputFormItem>
    </InputItemsRow>
    <Hr class="my-4" />
    <InputItemsRow>
      <Button disabled={!validState} type="submit" class="ml-auto" outline
        ><PaperPlaneOutline /> {$_t("Send")}</Button
      >
    </InputItemsRow>
  </form>
{/if}
