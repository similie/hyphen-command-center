<script lang="ts">
  import {
    InputFormItem,
    InputItemsRow,
    RequiredLabel,
    Toast,
  } from "$components";
  import { _t, DeviceConfigModel } from "$lib";
  import { Button, Hr, Input, Label, Spinner, Textarea } from "flowbite-svelte";
  import { PaperPlaneOutline } from "flowbite-svelte-icons";
  type MQTTEvent = {
    topic: string;
    data: string;
  };
  const api = new DeviceConfigModel();
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

  const sendEvent = async () => {
    try {
      loading = true;
      const result = await api.publish(event.topic, event.data);
      if (!result.ok) {
        return Toast.error($_t("Failed to send event"));
      }
      Toast.success($_t("Event sent successfully"));
    } catch {
      console.error("Failed to send event");
      Toast.error($_t("Failed to send event"));
    } finally {
      loading = false;
    }
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
        <Label>{$_t("Data")}</Label>
        <Textarea bind:value={event.data} class="w-full" />
      </InputFormItem>
    </InputItemsRow>
    <Hr class="my-4" />
    <InputItemsRow>
      <Button
        onclick={sendEvent}
        disabled={!validState}
        type="submit"
        class="ml-auto"
        outline><PaperPlaneOutline /> {$_t("Send")}</Button
      >
    </InputItemsRow>
  </form>
{/if}
