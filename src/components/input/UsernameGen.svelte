<script lang="ts">
  import {
    generateFromEmail,
    generateUsername,
  } from "unique-username-generator";

  import { Input, ButtonGroup, Button } from "flowbite-svelte";
  import {
    _t,
    type UserModel,
    UserApi,
    UserValidityResults,
    Debounce,
  } from "$lib";
  import {
    BellActiveOutline,
    CheckCircleOutline,
    CloseOutline,
  } from "flowbite-svelte-icons";
  const debounce = new Debounce();
  let {
    user = $bindable(),
    valid = $bindable(false),
    disabled = false,
    token = "",
    onChange,
    clear = $bindable(),
  } = $props<{
    user: UserModel | Partial<UserModel>;
    token?: string;
    disabled?: boolean;
    valid?: boolean;
    clear?: () => void;
    onChange?: (username: string) => void;
  }>();

  const api = new UserApi();
  let model: string = $state(user.username || "");
  let originalUsername: string = $state(user.username || "");
  let changed = $state(false);

  let validityCheck = $state(
    user.uid ? UserValidityResults.VALID : UserValidityResults.PRISTINE,
  );
  let color: "green" | "red" | "alternative" | undefined = $state(undefined);

  const generateUsernameOptions = (): string => {
    if (user.email) {
      return generateFromEmail(user.email);
    }
    if (user.name) {
      return user.name?.toLowerCase().replace(/\s/g, "_");
    }
    return generateUsername();
  };

  const checkValidity = debounce.bounce(async () => {
    model = model.replace(/\s/g, "_");
    console.log("Checking validity for:", model, originalUsername);
    if (originalUsername && model === originalUsername) {
      validityCheck = UserValidityResults.VALID;
      user.username = model;
      return (color = getColor());
    }
    if (!model || model.length < 8) {
      validityCheck = UserValidityResults.PRISTINE;
      user.username = "";
      return (color = getColor());
    }
    const result = await api.valid({ username: model }, token);
    validityCheck = result.username
      ? UserValidityResults.VALID
      : UserValidityResults.INVALID;
    color = getColor();
    valid = validityCheck === UserValidityResults.VALID;
    if (!valid) {
      return;
    }
    user.username = model;
    onChange && onChange(model);
  }, 500);

  const getColor = (): "green" | "red" | "alternative" | undefined => {
    if (validityCheck === UserValidityResults.VALID) {
      return "green";
    } else if (validityCheck === UserValidityResults.INVALID) {
      return "red";
    } else if (validityCheck === UserValidityResults.PRISTINE && changed) {
      return "alternative";
    }
    return undefined;
  };

  $effect(() => {
    if (user && !user.username && !changed) {
      model = generateUsernameOptions();
      checkValidity();
    }
  });

  clear = () => {
    model = generateUsernameOptions();
    checkValidity();
  };
</script>

<ButtonGroup class="w-full">
  <Input
    type="text"
    id="username"
    placeholder={$_t("Username")}
    bind:value={model}
    {disabled}
    oninput={() => {
      if (disabled) {
        return;
      }
      changed = true;
      checkValidity();
    }}
    required
  />

  <Button {color} class="w-20">
    {#if validityCheck == UserValidityResults.PRISTINE}
      <BellActiveOutline />
    {:else if validityCheck == UserValidityResults.VALID}
      <CheckCircleOutline />
    {:else}
      <CloseOutline />
    {/if}
  </Button>
</ButtonGroup>
