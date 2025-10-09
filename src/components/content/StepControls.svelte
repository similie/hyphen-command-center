<script lang="ts">
  import { Button, StepIndicator } from "flowbite-svelte";
  import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";
  import { _t } from "$lib";
  let {
    isDisabled = $bindable(),
    currentStep = $bindable(),
    steps,
    stepNext,
    stepBack,
  } = $props<{
    isDisabled: boolean;
    currentStep: number;
    steps: string[];
    stepNext?: (step: number) => void;
    stepBack?: (step: number) => void;
  }>();
</script>

<div class="flex w-full align-middle items-center content-center space-x-2">
  <Button
    type="button"
    onclick={() => {
      isDisabled = false;
      currentStep--;
      stepBack && stepBack(currentStep);
    }}
    disabled={currentStep <= 0}
    color="alternative"
    >{$_t("Back")}
    <ArrowLeftOutline class="w-5 h-5 ms-2" /></Button
  >
  <div class="flex-grow">
    <StepIndicator {steps} {currentStep} />
  </div>
  <Button
    type="button"
    onclick={() => {
      isDisabled = true;
      currentStep++;
      stepNext && stepNext(currentStep);
    }}
    disabled={isDisabled}
    class="px-4 ml-auto"
    >{$_t(currentStep < steps.length - 1 ? "Next" : "Create")}
    <ArrowRightOutline class="w-5 h-5 ms-2" /></Button
  >
</div>
