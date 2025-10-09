<script lang="ts">
  import { type SpacesModel, _t } from "$lib";
  import { Input, Label, Helper, Modal, Button, P } from "flowbite-svelte";
  import {
    ArrowDownOutline,
    SearchOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  let {
    model = $bindable(),
    disableNext = $bindable(false),
    required = false,
  } = $props<{
    model: Partial<SpacesModel>;
    disableNext: boolean;
    required?: boolean;
  }>();
  let formElement = $state<HTMLFormElement | null>(null);

  let blackListedPathsOpen = $state(false);
  let readyValue = $state<string | undefined>(undefined);

  const checkValidity = () => {
    disableNext = !formElement?.checkValidity();
  };

  $effect(checkValidity);

  onMount(() => {});

  const setReady = () => {};
</script>

<Modal
  title={$_t("Select Paths For Blacklisting")}
  bind:open={blackListedPathsOpen}
  size="xl"
></Modal>

<form bind:this={formElement} oninput={checkValidity}>
  <div class="grid gap-6 mb-6 md:grid-cols-2 w-2xl"></div>
  <input type="hidden" bind:value={readyValue} {required} />
</form>
