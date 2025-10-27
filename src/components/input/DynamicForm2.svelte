<script lang="ts">
  import { writable, derived } from "svelte/store";
  import { onMount, type Snippet } from "svelte";
  import {
    Debounce,
    type FormField,
    type FormModelValue,
    _t,
    generateUniqueId,
    isNumeric,
  } from "$lib";
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
    Span,
    Radio,
  } from "flowbite-svelte";
  import { MinusOutline, PlusOutline } from "flowbite-svelte-icons";
  import { generateUsername } from "unique-username-generator";
  import UserRoleSelect from "./UserRoleSelect.svelte";
  import type { _ } from "svelte-i18n";
  import RequiredLabel from "./RequiredLabel.svelte";
  import LocalDatePicker from "./LocalDatePicker.svelte";
  import StyleWriter from "./StyleWriter.svelte";
  import { FileUploadElement } from ".";

  let {
    fields = $bindable([]),
    cols = 1,
    loading = $bindable(false),
    edit = $bindable(true),
    model,
    noClear = $bindable(false),
    sideLabels = $bindable(false),
    createBtnClass = "",
    hideControls = $bindable(false),
    isDisabled = $bindable(true),
    clearOnSubmit = $bindable(false),
    submitName = "Submit",
    onsubmit,
    header,
    footer,
    children,
    controls,
    onModelRequest = $bindable(),
  } = $props<{
    fields: FormField[];
    cols?: number;
    loading?: boolean;
    edit?: boolean;
    model: any;
    noClear?: boolean;
    sideLabels?: boolean;
    createBtnClass?: string;
    hideControls?: boolean;
    isDisabled?: boolean;
    clearOnSubmit?: boolean;
    submitName?: string;
    onsubmit?: (form: FormData) => void;
    header?: Snippet;
    footer?: Snippet;
    controls?: Snippet<[FormModelValue, number]>;
    onModelRequest?: () => void;
  }>();

  const debounce = new Debounce();
  $effect(() => {
    isDisabled = !$isValid || !$isDirty || !formEl?.checkValidity() || loading;
  });
  let formEl = $state<HTMLFormElement | null>(null);
  let fieldValues = $state<FormField[]>([...fields]);
  // Initialize form data store based on fields
  let formData = writable<{ [key: string]: any }>(model || {});

  onMount(() => {
    formData.set(
      (fields as FormField[]).reduce<{ [key: string]: any }>(
        (acc: { [key: string]: any }, field: FormField) => {
          acc[field.name] =
            $formData[field.name] !== undefined
              ? $formData[field.name]
              : field.value || null;
          return acc;
        },
        {},
      ),
    );
  });

  // Track if the form is dirty
  const isDirty = derived(formData, ($formData) => {
    return fieldValues.some((field: FormField) => {
      const rawField = $state.snapshot<FormField>(field);
      if (!rawField.isDirty && $formData[field.name] !== rawField.value) {
        field.isDirty = true;
      }
      return rawField.isDirty; // $formData[field.name] !== field.value;
    });
  });

  const getLength = (field: FormField, $formData: { [key: string]: any }) => {
    switch (field.type) {
      case "number":
        return $formData[field.name];
      case "string":
        return field.max || field.min
          ? ($formData[field.name] || "").length
          : 0;
      default:
        return 0;
    }
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

  const isValidRequire = (field: FormField) => {
    const isArray = Array.isArray($formData[field.name]);
    if (isArray) {
      return $formData[field.name].length > 0;
    }
    return !!$formData[field.name];
  };

  const formValidation = ($formData: { [key: string]: any }) => {
    return (field: FormField) => {
      const length = getLength(field, $formData);
      const bools: Record<string, boolean> = {
        validate:
          (field.validate && field.validate($formData[field.name])) ||
          !field.validate,
        required: (field.required && isValidRequire(field)) || !field.required,
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
    const validation = formValidation($formData);
    const hasEvery = fieldValues.every(validation);
    return hasEvery;
  });

  const updateField = (name: string, value: any, index: number = -1) => {
    const formValues = { ...$formData };
    let localValue = isNumeric(value) ? +value : $state.snapshot(value); // stripStateFromObject(value);
    formValues[name] = localValue;
    if (index !== -1) {
      fieldValues[index].isDirty = true;
    }
    formData.set(formValues);
    if (!hideControls) {
      return;
    }
    handleSubmit();
  };

  // Handle input changes
  const handleInputChange = (name: string, e: any) => {
    const value = (e?.target as HTMLInputElement)?.value;
    updateField(name, value);
  };

  const getValue = (value: any) => {
    if (value && typeof value !== "string") {
      return JSON.stringify(value);
    }
    return value;
  };

  // // Handle form submission
  const handleSubmit = debounce.bounce(() => {
    const formDataObject = new FormData();
    for (const [key, value] of Object.entries($formData)) {
      formDataObject.append(key, getValue(value));
    }
    if (clearOnSubmit && !hideControls) {
      clearForm();
    } else if (!hideControls) {
      resetForm();
    }
    onsubmit && onsubmit(formDataObject);
  }, 300);

  onModelRequest = () => {
    handleSubmit();
  };

  const getId = (field: FormField) => {
    return `${field.name}-${generateUniqueId()}`;
  };

  const resetForm = () => {
    const form = $formData;
    fields.forEach((field: FormField) => {
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
      fieldValues.forEach((field: FormField) => {
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
    event: Event | undefined,
    field: FormField,
  ) => {
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

  const checkPattern = (field: FormField, value: any, special: any = "") => {
    if (!field.pattern) {
      return true;
    }
    const index = fieldValues.findIndex(
      (f: FormField) => f.name === field.name,
    );
    const valid = new RegExp(field.pattern).test(value) || value === "";
    fieldValues[index].hasError = !valid;
    fieldValues[index].errors = {
      ...field.errors,
      ["pattern_" + special]: !valid,
    };
    return valid;
  };

  export const resetModel = () => {
    clearForm();
    resetForm();
  };
</script>

{#if loading}
  <Heading tag="h5" class="text-center">{$_t("Loading")} <Spinner /></Heading>
{:else}
  <form
    bind:this={formEl}
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
  >
    <div class="grid grid-cols-1 md:grid-cols-{cols} gap-2 my-4">
      {@render header?.()}

      {#each fieldValues as field, i}
        {#if controls}
          <div class="flex w-full">
            {@render controls?.(field, i)}
          </div>
        {/if}
        {@const id = getId(field)}
        <div
          id="field-{id}"
          class={sideLabels
            ? "grid grid-cols-2 justify-center"
            : edit
              ? "flex flex-col"
              : "flex flex-col space-x-2"}
        >
          <div class="text-nowrap">
            {#if !edit}
              <Heading tag="h5">{$_t(field.label)}</Heading>
            {:else if field.required}
              <RequiredLabel
                color={field.hasError && field.isDirty ? "red" : undefined}
                for={id}
                content={field.label}
              />
            {:else}
              <Label
                color={field.hasError && field.isDirty ? "red" : undefined}
                for={id}>{$_t(field.label)}</Label
              >
            {/if}
          </div>
          {#if edit}
            {#if field.type === "text" || field.type === "string"}
              <Input
                type="text"
                {id}
                color={field.hasError && field.isDirty ? "red" : undefined}
                name={field.name}
                maxlength={(field.max as number) || null}
                placeholder={field.placeholder || ""}
                minlength={(field.min as number) || null}
                pattern={field.pattern ? field.pattern : undefined}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "number"}
              <Input
                type="number"
                {id}
                name={field.name}
                color={field.hasError ? "red" : undefined}
                max={(field.max as number) || null}
                min={(field.min as number) || null}
                step={(field.steps as number) || null}
                bind:value={$formData[field.name]}
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "date"}
              <!---->
              <LocalDatePicker
                {id}
                bind:value={$formData[field.name]}
                onselect={() => {
                  handleSubmit();
                }}
                required={field.required}
                minDate={field.min as Date | undefined}
                locale={field.locale}
                maxDate={field.max as Date | undefined}
              />
            {:else if field.type === "time"}
              <Input
                type="time"
                {id}
                name={field.name}
                color={field.hasError ? "red" : undefined}
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
                maxlength={(field.max as number) || null}
                minlength={(field.min as number) || null}
                bind:value={$formData[field.name]}
                class="w-full"
                oninput={(e) => handleInputChange(field.name, e)}
                required={field.required}
              />
            {:else if field.type === "rich_text"}
              <StyleWriter
                bind:value={$formData[field.name]}
                minLimit={field.min as number | undefined}
                countLimit={field.max as number | undefined}
                required={field.required}
                onchange={() => updateField(field.name, $formData[field.name])}
              />
            {:else if field.type === "file_upload"}
              <FileUploadElement
                {id}
                name={field.name}
                color={field.hasError ? "red" : undefined}
                bind:value={$formData[field.name]}
                accept={field.accept || "*"}
                multiple={field.multiple || false}
                required={field.required}
                maxSize={field.max as number | undefined}
                onchange={(value) => {
                  updateField(field.name, value);
                }}
              />
            {:else if field.type === "object" && $formData[field.name]}
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
                      value={typeof value === "string" ||
                      typeof value === "number"
                        ? value
                        : ""}
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
            {:else if field.type === "array"}
              <div class="flex-col space-y-2">
                {#each $formData[field.name] as value, index}
                  <div class="flex-col w-full">
                    <div class="flex space-x-1">
                      <Input
                        type="text"
                        id={id + "-val"}
                        name={field.name + "value"}
                        {value}
                        oninput={(e) => {
                          const value = (e.target as HTMLInputElement).value;

                          if (
                            field.pattern &&
                            !checkPattern(field, value, index)
                          ) {
                            return;
                          }
                          $formData[field.name][index] = value;
                          updateField(field.name, $formData[field.name]);
                        }}
                        required={true}
                      />
                      <Button
                        onclick={() => {
                          $formData[field.name].splice(index, 1);
                          updateField(field.name, $formData[field.name]);
                        }}
                        color="alternative"><MinusOutline /></Button
                      >
                    </div>

                    {#if field.errors && field.errors["pattern_" + index]}
                      <Helper color="red">{$_t("The input is invalid")}</Helper>
                    {/if}
                  </div>
                {/each}
                <Button
                  onclick={() => {
                    $formData[field.name] = $formData[field.name] || [];
                    $formData[field.name].push("");
                    updateField(field.name, $formData[field.name]);
                  }}><PlusOutline /></Button
                >
              </div>
            {:else if field.type === "checkbox"}
              {#if typeof $formData[field.name] !== "undefined"}
                <!--- value={$formData[field.name] ? true : false} -->
                <Checkbox
                  {id}
                  checked={$formData[field.name]}
                  oninput={(e) => {
                    const value = (e?.target as HTMLInputElement)?.checked;
                    updateField(field.name, value);
                  }}
                />
              {/if}
            {:else if field.type === "checkgroup"}
              <Checkbox
                group={$formData[field.name]}
                choices={(field.selectOptions || []).map((option) => ({
                  value: option.value as string,
                  label: $_t(option.name || ""),
                }))}
                oninput={(e) => {
                  const value = (e?.target as HTMLInputElement)?.value;
                  let index = $formData[field.name].indexOf(value);
                  if (index === -1) {
                    $formData[field.name].push(value);
                  } else {
                    $formData[field.name].splice(index, 1);
                  }
                  updateField(field.name, $formData[field.name]);
                }}
              />

              <div class="relative">
                <input
                  type="text"
                  {id}
                  class="sr-only"
                  value={($formData[field.name] || []).join(",") ?? undefined}
                  required={field.required}
                />
              </div>
            {:else if field.type === "radio"}
              <div class="flex gap-3">
                {#each field.selectOptions || [] as option}
                  <Radio
                    id={id + "-" + option.value}
                    name={field.name}
                    value={option.value}
                    required={field.required}
                    bind:group={$formData[field.name]}
                    oninput={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      updateField(field.name, value);
                    }}>{$_t(option.name || "")}</Radio
                  >
                {/each}
                <!-- <input
                  type="hidden"
                  value={$formData[field.name]}
                  required={field.required}
                /> -->
              </div>
            {:else if field.type === "role"}
              <UserRoleSelect
                bind:model={$formData[field.name]}
                noLabel={true}
                oninput={(e) => parseEventAgainNumericTarget(e, field)}
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
              {#key field.template}
                <field.template
                  required={field.required}
                  bind:field={fieldValues[i]}
                  value={$formData[field.name]}
                  oninput={(value: any) => updateField(field.name, value, i)}
                  {...field.props}
                />
              {/key}
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
            <P class="ml-auto-">
              {#if field.type === "checkbox"}
                <Span>{$formData[field.name] ? $_t("Yes") : $_t("No")}</Span>
              {:else if field.type === "object" && $formData[field.name]}
                <ul class="list-disc list-inside">
                  {#each Object.entries($formData[field.name]) as [key, value]}
                    <li>
                      <Span class="font-bold">{$_t(key || "")}</Span>: <Span
                        >{$_t((value as string) || "")}</Span
                      >
                    </li>
                  {/each}
                </ul>
              {:else if field.type === "checkgroup"}
                {#each field.selectOptions || [] as { name, value }}
                  <ul>
                    {#if $formData[field.name]?.includes(value)}
                      <li><Span>{$_t(name || "")}</Span></li>
                    {/if}
                  </ul>
                {/each}
                {#if !(field.selectOptions || []).length}
                  <Span>{$_t("No entries selected")}</Span>
                {/if}
              {:else if field.type === "radio"}
                {@const selectedOption = (field.selectOptions || []).find(
                  (option) => option.value === $formData[field.name],
                )}
                <Span
                  >{selectedOption ? $_t(selectedOption.name || "") : ""}</Span
                >
              {:else if field.type === "date"}
                <!---->
                <Span>
                  {$formData[field.name]
                    ? new Date($formData[field.name]).toLocaleDateString(
                        field.locale || "en-GB",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        },
                      )
                    : ""}
                </Span>
              {:else if field.type === "select" && field.selectOptions}
                {#each field.selectOptions as option}
                  {#if option.value === $formData[field.name]}
                    {$_t(option.name || "")}
                  {/if}
                {/each}
              {:else if field.type === "file_upload"}
                <FileUploadElement
                  {id}
                  name={field.name}
                  value={$formData[field.name]}
                  accept={field.accept || "*"}
                  edit={false}
                />
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
      {@render footer?.()}
    </div>
    {#if edit && !hideControls}
      <div class="flex space-x-2">
        {@render children?.()}

        {#if !noClear}
          <Button
            color="alternative"
            type="button"
            disabled={!$isDirty || loading}
            onclick={clearForm}>{$_t("Clear")}</Button
          >
        {/if}

        <Button
          class="ml-auto {createBtnClass}"
          type="submit"
          disabled={!$isValid ||
            !$isDirty ||
            !formEl?.checkValidity() ||
            loading}>{$_t(submitName)}</Button
        >
      </div>
    {/if}
  </form>
{/if}
