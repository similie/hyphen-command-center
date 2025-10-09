<script lang="ts">
  import { PasswordInput, UsernameGen, PasswordGen, Toast } from "$components";
  import InputItemsRow from "$components/input/InputItemsRow.svelte";
  import StyleWriter from "$components/input/StyleWriter.svelte";
  import { _t, siteUser, UserApi, Debounce, type UserModel } from "$lib";
  import { Label, Input, Button, Modal, Toggle, P } from "flowbite-svelte";
  export let model: UserModel | Partial<UserModel>;
  export let action: (() => void | Promise<void>) | undefined;
  export let dirty = false;
  export let saving = false;
  export let disabled: boolean = false;
  export let disabledForm = false;
  const api = new UserApi();

  let currentPassword = "";
  let checkPassword = "";
  let passwordChange = false;
  let allRequired = false;

  const debounce = new Debounce();
  const requiredFields = ["name", "username"];

  const onInput = debounce.bounce(() => {
    if (!model) {
      return (allRequired = true);
    }
    dirty = true;
    allRequired = UserApi.fieldValidator(model, requiredFields);
  }, 300);

  const checkValidity = () => {
    // Check if the model is valid
    onInput();
  };

  const saveChanges = async () => {
    if (!$siteUser || !model) {
      return;
    }
    saving = true;
    const userPartial: Partial<UserModel> = {};
    userPartial.username = model.username;
    userPartial.name = model.name;
    userPartial.avatar = model.avatar;
    userPartial.optOut = model.optOut;
    userPartial.bio = model.bio;
    try {
      const result = await api.profile($siteUser.uid, userPartial);
      if (!result || result.uid !== $siteUser.uid) {
        return Toast.error("Profile update error");
      }
      siteUser.set(result);
      dirty = false;
      allRequired = false;
    } catch (error) {
      console.error(error);
      Toast.error("Profile update error");
    } finally {
      saving = false;
    }
  };

  $: action = saveChanges;
  $: disabled = saving || !dirty || !allRequired || passwordChange;
  $: disabledForm = saving || passwordChange;
  // trigger if we need to check the validity of the form
  $: if (dirty && !passwordChange && !allRequired) {
    checkValidity();
  }
</script>

<form oninput={checkValidity}>
  <div class="flex flex-col space-y-4">
    <div class="flex space-x-2">
      <div class="flex flex-col space-y-2 flex-grow">
        <Label for="name">{$_t("Name")}</Label>
        <Input
          type="text"
          id="name"
          placeholder={$_t("Full name")}
          bind:value={model.name}
          disabled={disabledForm}
          required
        />
      </div>
      <div class="flex flex-col space-y-4">
        <P size="xs" italic>{$_t("Don't communicate with me")}</P>

        <Toggle name="opt" bind:checked={model.optOut}></Toggle>
      </div>
    </div>
    <div class="flex flex-col space-y-2">
      <Label for="username" class="mb-2"
        >{$_t("Username")}
        <small class="text-gray-500">({$_t("Minimum eight characters")})</small
        ></Label
      >
      <UsernameGen disabled={disabledForm} bind:user={model} />
    </div>

    <div class="flex flex-col space-y-2">
      <Label>{$_t("Your Bio")}</Label>
      <StyleWriter bind:value={model.bio} />
    </div>

    <div class="flex flex-col space-y-2">
      <Label for="password" class="mb-2">{$_t("Password")}</Label>
      <Button
        disabled={disabledForm}
        color="alternative"
        onclick={() => (passwordChange = true)}>{$_t("Change Password")}</Button
      >
    </div>
  </div>
</form>

{#if $siteUser}
  <Modal size="xs" bind:open={passwordChange}>
    {#if currentPassword}
      <Label for="password" class="mb-2"
        >{$_t("Password")}
        <small class="text-gray-500">({$_t("Minimum eight characters")})</small
        ></Label
      >
      <PasswordGen bind:model={checkPassword} noAuto />
      <Button
        disabled={!checkPassword || checkPassword.length < 8}
        class="w-full"
        size="sm"
        onclick={async () => {
          const result = await api.resetPassword($siteUser.uid, checkPassword);
          if (!result || result.uid !== $siteUser.uid) {
            return Toast.error("Password change error");
          }
          currentPassword = "";
          checkPassword = "";
          passwordChange = false;
          Toast.success("Password changed successfully");
        }}
      >
        {$_t("Save Changed Password")}
      </Button>
    {:else}
      <Label for="password" class="mb-2">{$_t("Current Password")}</Label>
      <PasswordInput bind:password={checkPassword} />
      <Button
        disabled={!checkPassword || checkPassword.length < 8}
        class="w-full"
        size="sm"
        color="alternative"
        onclick={async () => {
          const result = await api.validPassword($siteUser.uid, checkPassword);
          if (!result.valid) {
            return Toast.error("Incorrect Password");
          }
          currentPassword = checkPassword;
          checkPassword = "";
        }}
      >
        {$_t("Validate")}
      </Button>
    {/if}
  </Modal>
{/if}
