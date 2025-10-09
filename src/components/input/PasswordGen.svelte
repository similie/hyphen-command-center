<script lang="ts">
  import { Button } from "flowbite-svelte";
  import { _t, generateRandomPassword } from "$lib";
  import PasswordInput from "./PasswordInput.svelte";

  let {
    model = $bindable(""),
    minCharacters = 8,
    noAuto = false,
    disabled = false,
    onChange,
  } = $props<{
    model?: string;
    minCharacters?: number;
    noAuto?: boolean;
    disabled?: boolean;
    onChange?: (password: string) => void;
  }>();
  let view = $state(false);
  // Manually trigger the input event
  // const triggerInputEvent = () => {
  //   const inputElement = document.getElementById("password");
  //   if (!inputElement) {
  //     return;
  //   }
  //   const event = new Event("input", { bubbles: true });
  //   inputElement.dispatchEvent(event);
  // };
  const autoGen = () => {
    view = true;
    model = generateRandomPassword(12);
    onChange && onChange(model);
  };
</script>

<div class="grid {noAuto ? 'grid-cols-1' : 'grid-cols-2'} gap-4">
  <PasswordInput {disabled} {view} bind:password={model} />

  {#if !noAuto && !model && model.length < minCharacters}
    <Button onclick={autoGen} color="primary"
      >{$_t("Auto Generate Password")}</Button
    >
  {/if}
</div>
