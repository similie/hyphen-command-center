<script lang="ts">
  import { SpacesApi, _t, type SpacesModel } from "$lib";
  import { Button, Heading, Hr, Spinner, P } from "flowbite-svelte";
  import { PlanStep1, PlanStep2, PlanStep3 } from "./steps";
  import { StepControls } from "$components";
  const api = new SpacesApi();
  let { onSubmit } = $props<{
    onSubmit: (plan: SpacesModel) => void;
  }>();
  let currentStep = $state(0);
  let isDisabled = $state(true);
  let model = $state<Partial<SpacesModel>>({});
  let loading = $state(false);
  // const steps = ["Space Details", "Tags and Restrictions", "Finished"];
  const steps = ["Space Details", "Finished"];
  const resetAll = () => {
    currentStep = 0;
    model = {};
  };

  const sendToServer = async () => {
    if (currentStep <= steps.length) {
      return;
    }
    loading = true;
    try {
      const results = await api.create(model);
      const result = Array.isArray(results) ? results.pop() : results;
      onSubmit && onSubmit(result);
    } catch (e) {
      console.error("Error generating space", e);
    } finally {
      loading = false;
    }
    setTimeout(resetAll, 2000);
  };

  const getStarted = () => {
    currentStep = 1;
  };
</script>

{#if currentStep === 0}
  <div class="flex w-full">
    <Button type="button" onclick={getStarted} size="xl" class="mx-auto"
      >{$_t("Let's start a new Space")}</Button
    >
  </div>
{/if}
{#if currentStep > 0}
  <div class="flex w-full flex-col items-center justify-center">
    <StepControls
      {steps}
      bind:currentStep
      bind:isDisabled
      stepNext={sendToServer}
    />

    <Hr />

    {#if loading}
      <div class="justify-center w-full">
        <P>{$_t("Loading...")}</P>
        <Spinner />
      </div>
    {:else}
      {#if currentStep === 1}
        <PlanStep1 bind:disableNext={isDisabled} bind:model />
      {/if}
      <!-- {#if currentStep === 2}
        <PlanStep2 bind:disableNext={isDisabled} bind:model />
      {/if} -->

      {#if currentStep === 2}
        <PlanStep3 bind:model bind:disableNext={isDisabled} />
      {/if}

      {#if currentStep > steps.length}
        <Heading class="text-center" tag="h3">{$_t("Space created")}</Heading>
      {/if}
    {/if}
  </div>
  <div class="flex flex-col w-full"></div>
{/if}
