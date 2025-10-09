<script lang="ts">
  import { SimpleBody } from "$layouts";
  import {
    Card,
    Heading,
    Span,
    Input,
    Label,
    Button,
    Spinner,
  } from "flowbite-svelte";
  import { _t, UserApi, type UserModel, APPLICATION_ROUTING } from "$lib";
  import { page } from "$app/state";
  import {
    UsernameGen,
    PasswordInput,
    AvatarBuilder,
    Toast,
  } from "$components";
  import { goto } from "$app/navigation";
  const routing = APPLICATION_ROUTING();
  let userRegistration = $state(page.data.register);
  const api = new UserApi();
  let loading = $state(false);
  let created = $state<UserModel | null>(null);

  const currentValues = () => {
    return JSON.parse(JSON.stringify(userRegistration));
  };

  const createAccount = async () => {
    console.log("createAccount", userRegistration);
    loading = true;
    try {
      const session = await api.accountCreate(currentValues());
      if (!session?.success) {
        return Toast.error("We failed to create this account");
      }
      created = session.user;
      goto(routing.ACCOUNTS.afterSignup);
    } catch (e: any) {
      console.error("FAILED TO CREATE ACCOUNT", e);
      return Toast.error(`Account creation failed: ${e.message}`);
    }

    loading = false;
  };
  let disabledSubmit = $state(false);

  const isValid = () => {
    return (
      userRegistration.name &&
      userRegistration.username &&
      userRegistration.password
    );
  };

  let formEl = $state<HTMLFormElement | null>(null);

  $effect(() => {
    disabledSubmit = !isValid() || !formEl?.checkValidity() || loading;
  });
</script>

<SimpleBody>
  <Card class="p-4 sm:p-6 md:p-8">
    <div class="text-center">
      <Heading tag="h3">{$_t("Let's finish your account")}</Heading>
      <Span>{page.data.register?.email}</Span>
    </div>

    {#if !loading}
      <form bind:this={formEl}>
        <div class="mb-6 flex space-x-3">
          <div class="flex-grow">
            <Label for="name" class="mb-2">{$_t("Full name")}</Label>
            <Input
              type="text"
              id="name"
              bind:value={userRegistration.name}
              required
            />
          </div>
          <div class="ml-auto">
            <Label for="password" class="mb-2 w-full">{$_t("Avatar")}</Label>
            <AvatarBuilder
              token={userRegistration.uid}
              size={"xl"}
              bind:avatar={userRegistration.avatar}
            />
          </div>
        </div>
        <div class="mb-6">
          <Label for="name" class="mb-2">{$_t("Username")}</Label>
          <UsernameGen token={userRegistration.uid} user={userRegistration} />
        </div>

        <div class="mb-6">
          <Label for="password" class="mb-2">{$_t("Password")}</Label>
          <PasswordInput
            bind:password={userRegistration.password}
            required={true}
          />
        </div>
      </form>
    {:else}
      <div class="p-8 text-center">
        <Heading tag="h6"
          >{$_t("Creating your account")}
          <Spinner class="me-3" size="4" /></Heading
        >
      </div>
    {/if}

    {#if !created}
      <Button onclick={createAccount} color="primary" disabled={disabledSubmit}>
        {$_t("Create Account")}</Button
      >
    {/if}
  </Card>
</SimpleBody>
