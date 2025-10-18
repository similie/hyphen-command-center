<script lang="ts">
  import MarkdownContentRender from "$components/content/markdown/MarkdownContentRender.svelte";
  import InputFormItem from "$components/input/InputFormItem.svelte";
  import InputItemsRow from "$components/input/InputItemsRow.svelte";
  import RequiredLabel from "$components/input/RequiredLabel.svelte";
  import { Toast } from "$components/toasts";
  import { _t, Debounce, DecoderModel, emitEvent, type IDecoder } from "$lib";

  import {
    Button,
    Card,
    Helper,
    Hr,
    Input,
    Label,
    P,
    Spinner,
    Textarea,
  } from "flowbite-svelte";
  import { FloppyDiskOutline } from "flowbite-svelte-icons";
  let formEl = $state<HTMLFormElement | null>(null);
  let { decoder } = $props<{ decoder?: IDecoder }>();
  let localDecoder = $state<Partial<IDecoder>>(decoder || {});
  let nameError = $state<boolean>(false);
  let nameErrorColor = $state<"red" | "green" | "orange" | undefined>(
    undefined,
  );
  let validForm = $state(false);
  let payload = $state(`{"example": "data"}`);
  let topic = $state(`Hy/Post/Black`);
  let results = $state<any>(null);
  let loading = $state(false);
  let creating = $state(false);
  const api = new DecoderModel();
  const debounce = new Debounce();

  const runTest = async () => {
    try {
      loading = true;
      const message = await api.testDecoder({
        topic,
        message: payload,
        payload,
        decoder: localDecoder,
      });
      if (!message.results) {
        results = { error: "No results returned" };
        return;
      }
      console.log("Test results:", message);
      results = message.results;
    } catch (e) {
      console.error("Error running test:", e);
    } finally {
      loading = false;
    }
  };

  const checkName = debounce.bounce(async () => {
    if (!localDecoder.name) {
      nameError = true;
      return (nameErrorColor = "orange");
    }

    nameError = await api.nameCheck(localDecoder.name);
    nameErrorColor = nameError ? "red" : "green";
    // Check if the decoder name is valid
  }, 500);

  const createDecoder = async () => {
    try {
      creating = true;
      const value = await (localDecoder.id
        ? api.save(localDecoder as IDecoder)
        : api.create(localDecoder));

      if (!value.id) {
        throw new Error("Failed to create decoder");
      }

      emitEvent<IDecoder>("decoder:created", value);
      if (localDecoder.id) {
        Toast.success($_t("Decoder updated successfully"));
        localDecoder = value;
      } else {
        Toast.success($_t("Decoder created successfully"));
        localDecoder = {};
      }
      results = null;
      nameError = false;
      nameErrorColor = undefined;
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
</script>

<div class="flex flex-wrap md:flex-nowrap space-x-4">
  <div class="w-full flex flex-col space-y-4 md:w-1/2">
    <form oninput={onInput} bind:this={formEl} class="w-full">
      <InputItemsRow>
        <InputFormItem>
          <RequiredLabel color={nameErrorColor} content={"Decoder Name"} />
          <Input
            oninput={checkName}
            required
            color={nameErrorColor}
            disabled={creating}
            bind:value={localDecoder.name}
          />
          <Helper color={nameErrorColor}
            >{$_t(
              "The name of the decoder script to use when decoding incoming messages. Must be unique",
            )}</Helper
          >
        </InputFormItem>
      </InputItemsRow>
      <InputItemsRow>
        <InputFormItem>
          <Label>{$_t("Description")}</Label>
          <Textarea
            bind:value={localDecoder.description}
            class="w-full"
            disabled={creating}
            placeholder={$_t("A brief description of the decoder")}
          />
        </InputFormItem>
      </InputItemsRow>

      <InputItemsRow>
        <InputFormItem>
          <RequiredLabel color={nameErrorColor} content={"Codec"} />
          <Textarea
            bind:value={localDecoder.codec}
            class="w-full"
            rows={10}
            required
            disabled={creating}
            placeholder={$_t("Your code is here")}
          />
        </InputFormItem>
      </InputItemsRow>
    </form>
  </div>
  <div class="w-full md:w-1/2 space-y-4">
    <InputItemsRow>
      <InputFormItem>
        <RequiredLabel color={nameErrorColor} content={"Sample Topic"} />
        <Input required color={nameErrorColor} bind:value={topic} />
      </InputFormItem>
    </InputItemsRow>
    <InputItemsRow>
      <InputFormItem>
        <Label>{$_t("Description")}</Label>
        <Textarea
          bind:value={payload}
          class="w-full"
          placeholder={$_t("The an example payload to test the decoder with")}
        />
      </InputFormItem>
    </InputItemsRow>
    <InputFormItem>
      <Label>{$_t("Test Payload")}</Label>
      <Card class="p-2 w-full max-w-full">
        <Button
          disabled={loading || !topic || !payload || !localDecoder.codec}
          onclick={runTest}
          outline>{$_t("Test Decoder")}</Button
        >
        {#if loading}
          <P class="mt-2 text-center">{$_t("Running test...")} <Spinner /></P>
        {:else if results}
          <Hr class="my-2" />
          <MarkdownContentRender
            content={`\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``}
          />
        {/if}
      </Card>
    </InputFormItem>
  </div>
</div>

<div class="flex w-full flex-col">
  <Hr class="my-4" />
  <Helper class="mb-2">
    <P>
      {$_t(
        `The codec is a JavaScript function that takes in a topic and message and returns a decoded object. You have access to the following global libraries: JSON, Buffer, crypto, msgpackr, atob (to parse base64 strings). Your parsed message is "payload" Buffer and you have context such as topic, uid (message ID), and device in the "context" variable. Be sure to return a value. For example, a simple codec that parses JSON is a follows`,
      )}:</P
    >
  </Helper>
  <MarkdownContentRender
    content={`\`\`\`javascript\nreturn JSON.parse(payload.toString());\n\`\`\``}
  />

  <Button
    disabled={nameError ||
      !localDecoder.name ||
      !localDecoder.codec ||
      creating ||
      !validForm}
    class="mt-4"
    onclick={createDecoder}><FloppyDiskOutline /> {$_t("Save Decoder")}</Button
  >
</div>
