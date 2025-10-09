<script lang="ts">
  import { generateUniqueId } from "$lib";
  import { writable } from "svelte/store";
  const BACKSPACE_KEY_CODE = "Backspace";
  const ARROW_LEFT = "ArrowLeft";
  const ARROW_RIGHT = "ArrowRight";
  const avoidKeys = [BACKSPACE_KEY_CODE, ARROW_LEFT, ARROW_RIGHT];
  type InputValueType = {
    val: string;
    id: string;
    el: HTMLInputElement | null;
    hide: boolean;
  };

  const values = writable<InputValueType[]>([]);

  const setupValues = () => {
    const setup: InputValueType[] = [];
    for (let i = 0; i < size; i++) {
      setup.push({
        val: "",
        id: generateUniqueId(),
        el: null,
        hide: false,
      });
    }
    values.set(setup);
    error = false;
  };

  let {
    size,
    value = $bindable(),
    disabled = false,
    error = false,
    onChange,
    onComplete,
    clear = $bindable(),
  } = $props<{
    size: number;
    error?: boolean;
    value?: string;
    disabled?: boolean;
    onChange?: (code: string) => void;
    onComplete?: (code: string) => void;
    clear?: () => void;
  }>();
  setupValues();

  clear = () => {
    setupValues();
  };

  const sendChange = (input: InputValueType, index: number) => {
    const currentValue = input.val;
    const valueString = currentValue.replace(/\D/g, "");
    const setValues = [...$values];
    if (!valueString.length) {
      setValues[index].val = "";
      setValues[index].hide = false;
    }

    for (let i = 0; i < valueString.length; i++) {
      const arraySet = index + i;
      if (arraySet >= size) {
        break;
      }
      const char = valueString[i];
      setValues[arraySet].val = char || "";
      if (arraySet < size - 1) {
        setValues[index + i + 1].el?.focus();
      }
      setValues[arraySet].hide = false;
    }
    values.set(setValues);
    const code = setValues.map((v) => v.val).join("");
    if (onChange) onChange(code);
    if (code.length === size && onComplete) {
      value = code;
      onComplete(code);
    }
  };

  const stepBack = (value: InputValueType, index: number) => {
    const currentValue = value.val;
    if (currentValue !== "") {
      return;
    }
    const backIndex = index - 1;
    if (backIndex < 0) {
      return;
    }
    $values[backIndex].el?.focus();
  };
  // Helper functions to update the hide property in the store:
  const setHide = (index: number, hide: boolean) => {
    values.update((vals) => {
      const updated = [...vals];
      updated[index].hide = hide;
      return updated;
    });
  };

  const setFocus = (index: number) => {
    if (index < 0) {
      index = 0;
    } else if (index > size - 1) {
      index = size - 1;
    }
    $values[index].el?.focus();
    $values[index].el?.select();
  };
</script>

<div class="flex justify-between">
  {#each $values as value, index}
    <input
      id={value.id}
      color={error ? "red" : "red"}
      bind:this={value.el}
      bind:value={value.val}
      {disabled}
      pattern="\d"
      class:hiddenColor={value.hide}
      onfocus={(e) => {
        const input = e.target as HTMLInputElement;
        input.select();
      }}
      onkeydown={(e) => {
        if (e.key === ARROW_LEFT) {
          return setFocus(index - 1);
        } else if (e.key === ARROW_RIGHT) {
          return setFocus(index + 1);
        }
        setHide(index, true);
        if (e.key !== BACKSPACE_KEY_CODE) {
          return;
        }
        stepBack(value, index);
      }}
      onkeyup={(e) => {
        if (avoidKeys.includes(e.key)) {
          return;
        }
        sendChange(value, index);
      }}
      class={`block disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right p-2.5 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 border ${error ? "border-red-300 dark:border-red-500 " : "border-gray-300 dark:border-gray-500 "} text-sm rounded-lg w-12 text-center`}
    />
  {/each}
</div>

<style>
  /* When the .hidden class is present, hide the text */
  input.hiddenColor {
    color: transparent;
    /* Optionally, hide the caret too */
    caret-color: transparent;
  }
</style>
