<script lang="ts">
  import { page } from "$app/stores";
  import {
    AvatarBuilder,
    UsernameGen,
    PasswordGen,
    Toast,
    UserRoleSelect,
    UserEmailInput,
  } from "$components";
  import { _t, siteUser, UserApi, Debounce, type UserModel } from "$lib";
  import { Label, Input, Button, Hr } from "flowbite-svelte";
  import { PlusOutline } from "flowbite-svelte-icons";
  const config = $page.data.config;
  const defaultUser = { role: config.defaultRole, password: "" };
  let {
    user = { ...defaultUser },
    oncomplete,
    autoClear = false,
  } = $props<{
    model?: UserModel | Partial<UserModel>;
    autoClear?: boolean;
    oncomplete: (user: UserModel) => void;
  }>();
  let model = $state<UserModel | Partial<UserModel>>(user);

  const api = new UserApi();
  let dirty = $state(false);
  let saving = $state(false);
  let allRequired = $state(false);
  let clear = $state<(() => void) | undefined>();
  const debounce = new Debounce();
  let reloadInputs = $state(false);
  const requiredFields = ["name", "username", "email", "password", "role"];
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

  const onRoleChange = () => {
    dirty = true;
    allRequired = UserApi.fieldValidator(model, requiredFields);
  };

  const runReload = () => {
    reloadInputs = true;
    setTimeout(() => {
      reloadInputs = false;
    }, 100);
  };

  const setUser = (changedUser: UserModel) => {
    if (!autoClear) {
      model = changedUser;
      user = changedUser;
    } else {
      model = { ...defaultUser };
      clear?.();
      user = model;
      runReload();
    }

    oncomplete(changedUser);
  };

  const saveChanges = async () => {
    if (!$siteUser || !model) {
      return;
    }
    saving = true;
    const userPartial: Partial<UserModel> = {};
    userPartial.username = model.username;
    userPartial.email = model.email;
    userPartial.name = model.name;
    userPartial.avatar = model.avatar;
    userPartial.role = model.role;
    userPartial.password = model.password;
    let result;
    try {
      const uid = model.uid;
      if (uid) {
        result = await api.update(userPartial, { uid });
        if (!result || result.uid !== uid) {
          return Toast.error("Account update error");
        }
        oncomplete(result);
      } else {
        result = await api.create(model);
        if (!result) {
          return Toast.error("Account creation error");
        }
      }
      dirty = false;
      allRequired = false;
    } catch (error) {
      console.error(error);
      Toast.error("Profile update error");
    } finally {
      saving = false;
    }

    if (!result) {
      return;
    }
    setUser(result);
  };
</script>

<form oninput={checkValidity} onsubmit={saveChanges}>
  <div class="flex flex-col space-y-4">
    <div class="flex space-x-2">
      <div class="flex flex-col space-y-2 flex-1">
        <Label for="name">{$_t("Name")}</Label>
        <Input
          type="text"
          id="name"
          placeholder={$_t("Full name")}
          bind:value={model.name}
          disabled={saving}
          required
        />
      </div>
      <div class="flex flex-col space-y-2">
        <Label>{$_t("Avatar")}</Label>
        <AvatarBuilder
          disabled={saving}
          size={"xl"}
          bind:avatar={model.avatar}
        />
      </div>
    </div>
    <div class="flex flex-col space-y-4">
      <Label>{$_t("User Role")}</Label>

      <UserRoleSelect
        disabled={saving}
        bind:model={model.role}
        text={$_t("Select a role")}
        noLabel
        oninput={onRoleChange}
      />
    </div>
    {#if !reloadInputs}
      <div class="flex flex-col space-y-2">
        <Label for="username" class="mb-2"
          >{$_t("Username")}
          <small class="text-gray-500"
            >({$_t("Minimum eight characters")})</small
          ></Label
        >
        <UsernameGen
          disabled={saving}
          bind:user={model}
          bind:clear
          onChange={checkValidity}
        />
      </div>
      <div class="flex flex-col space-y-2">
        <Label class="mb-2">{$_t("Email")}</Label>
        <UserEmailInput
          disabled={saving}
          bind:user={model}
          onChange={checkValidity}
        />
      </div>
    {/if}
    {#if !model.uid || model.uid === ($siteUser && $siteUser.uid)}
      <div class="flex flex-col space-y-2">
        <Label class="mb-2">{$_t("Password")}</Label>
        <PasswordGen
          disabled={saving}
          bind:model={model.password}
          onChange={checkValidity}
        />
      </div>
    {/if}
  </div>

  <Hr class="my-4" />
  <div class="flex w-full mt-4">
    <Button
      type="submit"
      class="ml-auto"
      disabled={saving || !allRequired || !dirty}
      >{$_t("Create")} <PlusOutline /></Button
    >
  </div>
</form>
