<script lang="ts">
  import InputFormItem from "$components/input/InputFormItem.svelte";
  import InputItemsRow from "$components/input/InputItemsRow.svelte";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";
  import { Toast } from "$components/toasts";
  import {
    type IParameters,
    type ParameterToForwardDetails,
    ParameterValueOwnerBy,
    ParametersModel,
    type UUID,
    _t,
  } from "$lib";
  import {
    A,
    Button,
    ButtonGroup,
    Card,
    Heading,
    Helper,
    Input,
    InputAddon,
    Label,
    P,
    Spinner,
    Toggle,
  } from "flowbite-svelte";
  import { FloppyDiskOutline, TrashBinOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  const api = new ParametersModel();
  let {
    value = $bindable(),
    valid = $bindable(),
    keys,
    name,
    owner,
    ownedBy = ParameterValueOwnerBy.SYSTEM,
    onChange,
    disabled = false,
    editable = true,
  } = $props<{
    value?: UUID[] | string[];
    keys: ParameterToForwardDetails[];
    name: string;
    ownedBy?: ParameterValueOwnerBy;
    owner?: UUID;
    valid?: boolean;
    disabled?: boolean;
    onChange?: (vals: UUID[]) => void;
    editable?: boolean;
  }>();

  let paramValues = $state<IParameters[]>([]);
  let paramValuesMap = $state<Record<string, IParameters>>({});

  const checkValidity = () => {
    valid = keys.every(
      (k: ParameterToForwardDetails) => !!paramValuesMap[k.key],
    );
    onChange?.(value as UUID[]);
  };

  const findValues = async () => {
    if (!value || value.length === 0) {
      return (valid = false);
    }
    try {
      paramValues = await api.find({ id: value as UUID[] }).fetch();
      paramValues.forEach((p) => {
        paramValuesMap[p.key] = p;
      });

      checkValidity();
    } catch (e) {
      console.error("Error fetching parameter values for secret params", e);
    }
  };

  let keyValues = $state<
    Record<string, { value: string; secret: boolean; saving: boolean }>
  >({});

  onMount(() => {
    value = value || [];
    for (const key of keys) {
      keyValues[key.key] = { value: "", secret: false, saving: false };
    }
    findValues();
  });

  const sendParamsValues = (key: string) => {
    const param = keyValues[key];
    console.log("Sending param value for key", key, param);
    if (!param || !param.value) {
      return Toast.error("Cannot save empty parameter value");
    }
    param.saving = true;
    api
      .create({
        key,
        value: param.value,
        secret: param.secret,
        owner,
        ownedBy,
        name: `${name} - ${key}`,
      })
      .then((created) => {
        console.log("Created parameter for secret param input", key, created);
        paramValuesMap[key] = created;
        value = [...(value || []), created.id as UUID];
        param.saving = false;
        checkValidity();
      })
      .catch((e) => {
        console.error("Error creating parameter for secret param input", e);
        param.saving = false;
      });
  };
  let destroyValueWarning = $state(false);
  let destroyKey = $state<string>("");
  const destroyValue = (key: string) => {
    const val = paramValuesMap[key];
    console.log("Destroying parameter value for key", key, val);
    if (!val) {
      return;
    }

    api
      .destroy(val)
      .then(() => {
        console.log("Destroyed parameter value for key", key);
        delete paramValuesMap[key];
        value = (value as UUID[]).filter((v) => v !== val.id);
        checkValidity();
      })
      .catch((e) => {
        console.error("Error destroying parameter value for key", key, e);
      });
  };
</script>

{#if editable}
  <DestroyModelModal
    bind:open={destroyValueWarning}
    onDestroy={destroyValue}
    model={destroyKey}
    onCancel={() => (destroyKey = "")}
    title={$_t("Confirm Deletion")}
    body={$_t("Are you sure you want to delete this parameter?")}
  />
{/if}
<div class="flex flex-col w-full space-x-4 space-y-4">
  {#each keys as key}
    {#if paramValuesMap[key.key]}
      <Card class="p-2">
        <div class="flex items-center space-x-2 mb-2">
          <Heading tag="h5">{paramValuesMap[key.key].name}</Heading>
          {#if editable}
            <A
              class="ml-auto"
              color="rose"
              {disabled}
              onclick={() => {
                destroyKey = key.key;
                destroyValueWarning = true;
              }}><TrashBinOutline /></A
            >
          {/if}
        </div>

        <P class="text-sm">
          {$_t("Parameter")}: <strong>{key.key}</strong>
        </P>
        <P class="text-sm">
          {$_t("Value")}:
          <strong
            >{paramValuesMap[key.key].secret
              ? $_t("(Secret)")
              : paramValuesMap[key.key].value}</strong
          >
        </P>
      </Card>
    {:else}
      <Card class="p-4 max-w-full ">
        <P class="text-sm">
          {$_t("Parameter:")} <strong>{key.key}</strong> =&gt;
          <em>{$_t("Not Assigned")}</em>
        </P>
        {#if keyValues[key.key]}
          <InputItemsRow class="items-center">
            <InputFormItem grow>
              <Label
                >{$_t("Value")}
                <small
                  ><em
                    >{$_t(
                      "Note: to alter a parameter, you must delete it, and create a new value",
                    )}</em
                  ></small
                ></Label
              >
              <ButtonGroup class="w-full">
                <InputAddon>
                  <Toggle
                    spanClass={"dark:bg-gray-800 bg-gray-600"}
                    bind:checked={keyValues[key.key].secret}
                    {disabled}>{$_t("Secret")}</Toggle
                  >
                </InputAddon>
                <Input
                  {disabled}
                  bind:value={keyValues[key.key].value}
                  required
                />

                <Button
                  disabled={keyValues[key.key].saving ||
                    !keyValues[key.key].value ||
                    disabled ||
                    !editable}
                  onclick={() => sendParamsValues(key.key)}
                  outline
                  >{#if keyValues[key.key].saving}
                    <Spinner size="5" />
                  {:else}
                    <FloppyDiskOutline />
                  {/if}</Button
                >
              </ButtonGroup>
              <Helper class="mt-2" color="primary">
                {$_t(
                  "This value is required. A secret value will be stored as an encrypted value in the database.",
                )}
              </Helper>
            </InputFormItem>
          </InputItemsRow>
        {/if}
      </Card>
    {/if}
  {/each}
</div>
