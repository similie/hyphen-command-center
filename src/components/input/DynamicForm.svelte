<script lang="ts">
  import { writable, derived, get } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import { type FormField, _t, generateUniqueId, isNumeric } from "$lib";
  import {
    Input,
    Button,
    Textarea,
    Heading,
    Spinner,
    Helper,
    P,
    Select,
    Label,
    Checkbox,
  } from "flowbite-svelte";
  import { MinusOutline, PlusOutline } from "flowbite-svelte-icons";
  import { generateUsername } from "unique-username-generator";
  import UserRoleSelect from "./UserRoleSelect.svelte";

  // Props for the fields
  export let fields: FormField[];
  export let cols: number = 1;
  export let loading = false;
  export let edit = true;
  export let model: any = {};
  export let noClear = false;
  export let sideLabels = false;
  export let createBtnClass = "";
  export let hideControls = false;
  export let isDisabled = true;
  export let clearOnSubmit = false;
  export let submitName = "Submit";

  $: isDisabled = !$isValid || !$isDirty;
  // Event dispatcher
  const dispatch = createEventDispatcher<{ submit: FormData }>();
  // Initialize form data store based on fields
  let formData = writable<{ [key: string]: any }>(model);

  $: formData.set(
    fields.reduce<{ [key: string]: any }>((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {}),
  );

  // Track if the form is dirty
  const isDirty = derived(formData, ($formData) => {
    return fields.some((field) => {
      if (!field.isDirty && $formData[field.name] !== field.value) {
        field.isDirty = true;
      }
      return $formData[field.name] !== field.value;
    });
  });

  const getLength = (field: FormField, $formData: { [key: string]: any }) => {
    const length =
      field.type === "number"
        ? $formData[field.name]
        : (field.max || field.min) && typeof $formData[field.name] === "string"
          ? ($formData[field.name] || "").length
          : 0;
    return length;
  };

  const hasEvery = (bools: Record<string, boolean>, field: FormField) => {
    let validity = true;
    const errors: Record<string, boolean> = {};
    for (const key in bools) {
      const val = bools[key];
      if (val) {
        continue;
      }
      errors[key] = true;
      validity = false;
    }
    field.hasError = !validity;
    field.errors = errors;
    return validity;
  };

  const formValidation = ($formData: { [key: string]: any }) => {
    return (field: FormField) => {
      const length = getLength(field, $formData);
      const bools: Record<string, boolean> = {
        validate:
          (field.validate && field.validate($formData[field.name])) ||
          !field.validate,
        required: (field.required && $formData[field.name]) || !field.required,
        max: (field.max && length <= field.max) || !field.max,
        min: (field.min && length >= field.min) || !field.min,
      };
      return hasEvery(bools, field);
    };
  };

  const printValue = (field: FormField) => {
    return typeof $formData[field.name] === "undefined" ||
      $formData[field.name] === null
      ? ""
      : $formData[field.name].toString().replace(/\n/g, "<br/>");
  };
  // Track if the form is valid
  const isValid = derived(formData, ($formData) => {
    const hasEvery = fields.every(formValidation($formData));
    return hasEvery;
  });

  const updateField = (name: string, value: any) => {
    const formValues = { ...$formData };
    let localValue = isNumeric(value) ? +value : value;
    formValues[name] = localValue;
    formData.set(formValues);
  };

  // Handle input changes
  const handleInputChange = (name: string, e: any) => {
    const value = (e?.target as HTMLInputElement)?.value;
    console.log("Input change", name, value);
    updateField(name, value);
  };

  const getValue = (value: any) => {
    if (value && typeof value !== "string") {
      return JSON.stringify(value);
    }
    return value;
  };

  // Handle form submission
  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const formDataObject = new FormData();
    for (const [key, value] of Object.entries($formData)) {
      formDataObject.append(key, getValue(value));
    }
    if (clearOnSubmit) {
      clearForm();
    }
    resetForm();
    dispatch("submit", formDataObject);
  };

  const getId = (field: FormField) => {
    return `${field.name}-${generateUniqueId()}`;
  };

  const resetForm = () => {
    const form = $formData;
    fields.forEach((field) => {
      field.value = form[field.name];
      field.errors = {};
      field.isDirty = false;
    });
    // triggering the the form reset
    formData.update((data) => {
      return data;
    });
  };

  const clearForm = () => {
    formData.update((data) => {
      fields.forEach((field) => {
        data[field.name] = field.value;
        field.errors = {};
        field.isDirty = false;
      });
      return data;
    });
  };

  const onEntriesInputChange = (
    event: Event,
    field: FormField,
    originalKey: string,
    value: any,
  ) => {
    const keyValue = (event.target as HTMLInputElement)?.value || "";
    if (!keyValue) {
      return;
    }
    const changed = keyValue.replace(/\s/g, "_");
    delete $formData[field.name][originalKey];
    $formData[field.name][changed] = value;
    updateField(field.name, $formData[field.name]);
  };

  const parseEventAgainNumericTarget = (
    e: CustomEvent<Event | undefined>,
    field: FormField,
  ) => {
    const event = e.detail;
    if (!event) {
      return;
    }
    if (event && event.target && "value" in event.target) {
      const value = event?.target.value as string;
      updateField(field.name, +value);
    }
  };

  const onEntriesInputValueChange = (
    event: Event,
    field: FormField,
    originalKey: string,
  ) => {
    const keyValue = (event.target as HTMLInputElement)?.value || "";
    $formData[field.name][originalKey] = keyValue;
    updateField(field.name, $formData[field.name]);
  };
</script>

{#if loading}
  <Heading tag="h5" class="text-center">{$_t("Loading")} <Spinner /></Heading>
{:else}
  <form on:submit={handleSubmit}>
    <div class="grid grid-cols-{cols} gap-2 my-4">
      <slot name="header" />

      {#each fields as field}
        {@const id = getId(field)}
        <div
          id="field-{id}"
          class={sideLabels ? "grid grid-cols-2 justify-center" : "flex-col"}
        >
          <div>
            <Label color={field.hasError ? "red" : undefined} for={id}
              >{$_t(field.label)}</Label
            >
          </div>
          {#if edit}
            {#if field.type === "text"}
              <Input
                type="text"
                {id}
                color={field.hasError && !field.isDirty ? "red" : "base"}
                name={field.name}
                maxlength={field.max || null}
                minlength={field.min || null}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "number"}
              <Input
                type="number"
                {id}
                name={field.name}
                color={field.hasError ? "red" : "base"}
                max={field.max || null}
                min={field.min || null}
                step={field.steps || null}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "email"}
              <Input
                type="email"
                {id}
                color={field.hasError ? "red" : undefined}
                name={field.name}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "textarea"}
              <Textarea
                name={field.name}
                {id}
                color={field.hasError ? "red" : "base"}
                maxlength={field.max || null}
                minlength={field.min || null}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "object"}
              <div class="flex-col space-y-2">
                {#each Object.entries($formData[field.name]) as [key, value]}
                  {@const originalKey = key}
                  <div class="flex space-x-1">
                    <Input
                      type="text"
                      id={id + "-key"}
                      name={key + "key"}
                      value={key}
                      oninput={(e) =>
                        onEntriesInputChange(e, field, originalKey, value)}
                      required={true}
                    />
                    <Input
                      type="text"
                      id={id + "-val"}
                      name={field.name + "value"}
                      {value}
                      oninput={(e) =>
                        onEntriesInputValueChange(e, field, originalKey)}
                      required={true}
                    />
                    <Button
                      onclick={() => {
                        delete $formData[field.name][key];
                        updateField(field.name, $formData[field.name]);
                      }}
                      color="alternative"><MinusOutline /></Button
                    >
                  </div>
                {/each}
                <Button
                  onclick={() => {
                    $formData[field.name] = $formData[field.name] || {};
                    $formData[field.name][generateUsername()] = "";
                    updateField(field.name, $formData[field.name]);
                  }}><PlusOutline /></Button
                >
              </div>
            {:else if field.type === "checkbox"}
              <Checkbox
                {id}
                checked={$formData[field.name] || false}
                bind:value={$formData[field.name]}
                oninput={(e) => {
                  console.log("FUCKING CHANGE", e, $formData[field.name]);
                  // handleInputChange(field.name, e);
                }}
              />
            {:else if field.type === "role"}
              <UserRoleSelect
                bind:model={$formData[field.name]}
                noLabel={true}
                oninput={(e) => handleInputChange(field.name, e)}
              />
            {:else if field.type === "select"}
              <Select
                {id}
                required={field.required}
                items={field.selectOptions}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                placeholder={field.placeholder || ""}
              />
            {:else if field.type === "template"}
              <svelte:component
                this={field.template}
                required={field.required}
                bind:value={$formData[field.name]}
                oninput={(value: any) => updateField(field.name, value)}
                bind:props={field.props}
              />
            {:else}
              <!-- Fallback or additional input types -->
              <Input
                type="text"
                name={field.name}
                {id}
                color={field.hasError ? "red" : "base"}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {/if}

            {#if field.errors && field.errors.required && field.isDirty}
              <Helper color="red">
                <span class="font-medium">{$_t("This field is required")}</span>
              </Helper>
            {:else if field.errors && field.errors.min && field.isDirty}
              <Helper color="red">
                <span class="font-medium"
                  >{$_t("This value violates the minimum requirement: ") +
                    field.min}</span
                >
              </Helper>
            {:else if field.errors && field.errors.max && field.isDirty}
              <Helper color="red">
                <span class="font-medium"
                  >{$_t("This value violates the maximum requirement: ") +
                    field.max}
                </span>
              </Helper>
            {:else if field.errors && field.errors.validate && field.isDirty}
              <Helper color="red">
                <span class="font-medium">{$_t("This field is invalid")}</span>
              </Helper>
            {/if}
          {:else}
            <P align="right">
              {#if field.type === "checkbox"}
                <p>{$formData[field.name] ? "Yes" : "No"}</p>
              {:else if field.type === "object"}
                {#each Object.entries($formData[field.name]) as [key, value]}
                  <p>{key}: {value}</p>
                {/each}
              {:else if field.type === "select" && field.selectOptions}
                {#each field.selectOptions as option}
                  {#if option.value === $formData[field.name]}
                    {$_t(option.name || "")}
                  {/if}
                {/each}
              {:else if field.print === "code"}
                <code>{@html printValue(field)}</code>
              {:else if field.print === "pre"}
                <pre>{@html printValue(field)}</pre>
              {:else}
                {printValue(field)}
              {/if}
            </P>
          {/if}
        </div>
      {/each}
      <slot name="footer" />
    </div>
    {#if edit && !hideControls}
      <div class="flex">
        <slot />

        {#if !noClear}
          <Button color="alternative" type="button" onclick={clearForm}
            >{$_t("Clear")}</Button
          >
        {/if}
        <Button
          class="ml-auto {createBtnClass}"
          type="submit"
          disabled={!$isValid || !$isDirty}>{$_t(submitName)}</Button
        >
      </div>
    {/if}
  </form>
{/if}
