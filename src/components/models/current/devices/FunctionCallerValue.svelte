<script lang="ts">
  import {
    Button,
    Label,
    Input,
    ButtonGroup,
    FloatingLabelInput,
    Spinner,
  } from "flowbite-svelte";
  import {
    CloseOutline,
    DownloadOutline,
    PaperPlaneOutline,
  } from "flowbite-svelte-icons";
  import type { Snippet } from "svelte";

  let {
    callValue,
    onCall,
    disabled = false,
    loading = false,
    reset = false,
    setValue = "",
    children,
  } = $props<{
    callValue: string;
    onCall: (value: string, call: string) => void;
    disabled?: boolean;
    setValue?: string;
    loading?: boolean;
    reset?: boolean;
    children?: Snippet;
  }>();
  let value = $state<string>("");
  $effect(() => {
    if (setValue) {
      value = setValue;
    }
  });
</script>

<div class="flex w-full space-x-2">
  <FloatingLabelInput
    class="flex-grow"
    type="text"
    variant="outlined"
    bind:value
    labelClass="rounded-xl"
    disabled={disabled || loading}
  >
    {callValue}
  </FloatingLabelInput>
  <Button
    disabled={loading}
    outline
    color={reset ? "green" : undefined}
    class="ml-auto relative"
    onclick={() => onCall(value, callValue)}
    type="button"
  >
    {#if loading}
      <Spinner size={"4"} />
    {:else if reset}
      <CloseOutline size={"sm"} />
    {:else if disabled}
      <DownloadOutline size={"sm"} />
    {:else}
      <PaperPlaneOutline size={"sm"} />
    {/if}

    {children?.()}
  </Button>
</div>
