<script lang="ts">
  import { Input, ButtonGroup, InputAddon } from "flowbite-svelte";
  import {
    _t,
    type UserModel,
    UserApi,
    UserValidityResults,
    Debounce,
    validateEmail,
  } from "$lib";
  import {
    BellActiveOutline,
    CheckCircleOutline,
    CloseOutline,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  const debounce = new Debounce();
  let {
    user = $bindable(),
    disabled,
    onChange,
  } = $props<{
    user: UserModel | Partial<UserModel>;
    disabled?: boolean;
    onChange?: (email: string) => void;
  }>();
  const api = new UserApi();
  let model = $state(user.email || "");
  let originalEmail = $state(user.email || "");
  let changed = false;
  let validityCheck = $state(UserValidityResults.PRISTINE);
  let color = $state<"green" | "red" | "default" | undefined>(undefined);
  const onValidate = () => {
    if (!user || user.email) {
      return;
    }
    originalEmail = user.email || "";
    model = originalEmail;
    validityCheck = UserValidityResults.PRISTINE;
    color = getColor();
  };
  const checkValidity = debounce.bounce(async () => {
    if (originalEmail && model === originalEmail) {
      validityCheck = UserValidityResults.VALID;
      user.email = model;
      return (color = getColor());
    }
    if (!model || !validateEmail(model)) {
      validityCheck = UserValidityResults.PRISTINE;
      user.email = "";
      return (color = getColor());
    }
    const result = await api.valid({ email: model });
    validityCheck = result.email
      ? UserValidityResults.VALID
      : UserValidityResults.INVALID;
    color = getColor();
    if (validityCheck !== UserValidityResults.VALID) {
      return;
    }
    user.email = model;
    onChange && onChange(model);
  }, 500);

  const getColor = (): "green" | "red" | "default" | undefined => {
    if (validityCheck === UserValidityResults.VALID) {
      return "green";
    } else if (validityCheck === UserValidityResults.INVALID) {
      return "red";
    } else if (validityCheck === UserValidityResults.PRISTINE && changed) {
      return "default";
    }
    return undefined;
  };

  onMount(onValidate);
</script>

<ButtonGroup class="w-full">
  <Input
    type="email"
    id="email"
    {color}
    placeholder={$_t("Email")}
    bind:value={model}
    {disabled}
    oninput={() => {
      changed = true;
      checkValidity();
    }}
    required
  />

  <InputAddon>
    {#if validityCheck == UserValidityResults.PRISTINE}
      <BellActiveOutline />
    {:else if validityCheck == UserValidityResults.VALID}
      <CheckCircleOutline />
    {:else}
      <CloseOutline />
    {/if}
  </InputAddon>
</ButtonGroup>
