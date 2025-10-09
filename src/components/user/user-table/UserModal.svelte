<script lang="ts">
  import { page } from "$app/stores";
  import {
    UserEmailInput,
    UserRoleSelect,
    ModelCreateLoader,
    AvatarBuilder,
    PasswordGen,
    UsernameGen,
    StyleWriter,
  } from "$components";

  import {
    type UserModel,
    UserRoles,
    _t,
    siteUser,
    Debounce,
    ModelActions,
    UserApi,
  } from "$lib";
  import { Button, Modal, Label, Input, Textarea } from "flowbite-svelte";
  import { tick } from "svelte";

  let {
    open = $bindable(false),
    model = $bindable(),
    oninput,
  } = $props<{
    open?: boolean;
    model: UserModel;
    oninput?: (action: ModelActions, user: UserModel) => void;
  }>();

  let saveModel: UserModel | Partial<UserModel> = $state(model);
  let deleteModal = $state(false);
  let saving = $state(false);
  let passwordUpdate = $state(false);
  let allRequired = $state(false);
  let emailValid = $state(true);
  const api = new UserApi();
  const debounce = new Debounce();

  let dirty = $state(false);

  const onInput = debounce.bounce(() => {
    dirty = true;
    allRequired = UserApi.fieldValidator(saveModel);
  }, 300);

  const deleteContent = async () => {
    if (!model.uid) {
      return;
    }
    await api.update({ active: false }, { uid: model.uid });
    oninput && oninput(ModelActions.DELETE, model);
  };

  const checkValidity = () => {
    onInput();
  };

  const clear = () => {
    dirty = false;
    passwordUpdate = false;
    saveModel = {
      ...model,
    };

    if (saveModel.uid) {
      return;
    }
  };

  const saveUser = async () => {
    saving = true;
    try {
      const action = model.uid ? ModelActions.UPDATE : ModelActions.CREATE;
      const changeModel = model.uid
        ? await api.update(saveModel, { uid: model.uid })
        : await api.create(saveModel);
      if (model.uid) {
        model = changeModel;
      }
      oninput && oninput(action, changeModel);
    } catch (e) {
      console.error("User Creation Error", e);
    } finally {
      clear();
      await tick();
      saving = false;
    }
  };
</script>

<Modal bind:open>
  {#snippet header()}
    <div class="flex space-x-2 items-center align-center w-full">
      <AvatarBuilder
        disabled={saving}
        bind:avatar={saveModel.avatar}
        onavatar={checkValidity}
      />
      <div>
        {$_t(saveModel.uid ? "Update" : "Create") + " " + $_t("User")}
      </div>
    </div>
  {/snippet}
  {#if !saving}
    <form oninput={checkValidity}>
      <div class="grid grid-cols-2 gap-4">
        {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
          <div>
            <Label for="name">{$_t("Full name")}</Label>
            <Input
              type="text"
              id="name"
              placeholder={$_t("Full name")}
              bind:value={saveModel.name}
              required
            />
          </div>
          <UserRoleSelect bind:model={saveModel.role} />
        {/if}
        <div>
          <Label for="username" class="mb-2"
            >{$_t("Username")}
            <small class="text-gray-500"
              >({$_t("Minimum eight characters")})</small
            ></Label
          >
          <UsernameGen bind:valid={emailValid} bind:user={saveModel} />
        </div>
        <div>
          <Label for="email" class="mb-2">{$_t("Email")}</Label>
          <UserEmailInput bind:user={saveModel} onChange={checkValidity} />
        </div>
      </div>
      <div class="mt-4 w-full">
        <Label for="bio">{$_t("User Bio")}</Label>
        <StyleWriter id="bio" bind:value={saveModel.bio} />
      </div>
      <div class="mt-4">
        {#if saveModel.uid && !passwordUpdate}
          <Button
            type="button"
            onclick={() => {
              saveModel.password = "";
              passwordUpdate = true;
            }}>{$_t("Change password")}</Button
          >
        {:else}
          <Label for="password"
            >{$_t("Password")}
            <small class="text-gray-500"
              >({$_t("Minimum eight characters")})</small
            ></Label
          >
          <PasswordGen
            onChange={checkValidity}
            bind:model={saveModel.password}
          />
        {/if}
      </div>
    </form>
  {:else}
    <ModelCreateLoader caption="User" />
  {/if}
  {#snippet footer()}
    {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER && !saving}
      <div class="flex w-full">
        <div class="ml-auto flex content-center space-x-4">
          {#if $siteUser && $siteUser.uid !== model.uid}
            <Button color="alternative" onclick={() => (deleteModal = true)}>
              {$_t("Delete")}
            </Button>
          {/if}
          <Button
            disabled={!dirty || !allRequired || !emailValid}
            class="ml-auto"
            color="primary"
            type="button"
            onclick={saveUser}
          >
            {$_t(model.uid ? "Update" : "Save")}
          </Button>
        </div>
      </div>
    {/if}
  {/snippet}
</Modal>

<Modal color="red" bind:open={deleteModal} autoclose>
  <div class="text-base leading-relaxed">
    {$_t("Are you sure you want to remove this content?")}
  </div>
  {#snippet footer()}
    <Button onclick={deleteContent} color="red">{$_t("Proceed")}</Button>
    <Button class="ml-auto" color="alternative">{$_t("Go Back")}</Button>
  {/snippet}
</Modal>
