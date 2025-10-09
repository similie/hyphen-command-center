<script lang="ts">
  import { page } from "$app/state";
  import { _t, siteUser, UserApi } from "$lib";
  import { Input, Label, Card, Button, Spinner } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { ContentHeader, UserAvatar } from "$components";
  import { SimpleBody } from "$layouts";

  const userApi = new UserApi();

  let identifier = $state("");
  let password = $state("");
  let processing = $state(false);
  let runningRefresh = $state(false);
  let clickNotReady = $state(false);
  const clear = () => {
    identifier = "";
    password = "";
  };

  const logout = async () => {
    clear();
    try {
      await userApi.logout();
      siteUser.set(undefined);
      location.reload();
    } catch (error) {
      console.error("LOGOUT ERROR", error);
    }
  };

  const login = async () => {
    processing = true;
    try {
      const results = await userApi.login({ identifier, password });
      if (!results || !results.success) {
        console.error("Login failed");
        return clear();
      }
      siteUser.set(results.user);
      if (results.user.resetPassword) {
        return goto("/password");
      }
      const routeTo = page.params.routeTo || "/";
      runningRefresh = true;
      location.href = routeTo;
    } catch (error) {
      console.error(error);
    } finally {
      processing = false;
    }
  };

  const handleSubmit = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || clickNotReady) {
      return;
    }
    return login();
  };

  $effect(() => {
    clickNotReady = !identifier || !password;
  });
</script>

<SimpleBody>
  {#if $siteUser}
    <Card class="p-4 sm:p-6 md:p-8">
      <div class="flex content-center items-center">
        {#if $siteUser?.avatar}
          <UserAvatar avatar={$siteUser.avatar} size="lg" />
        {/if}

        <div class="flex-col ml-4">
          {#if !runningRefresh}
            <small>{$_t("Signed in as")}:</small><br />
          {:else}
            <small>{$_t("Signing in")}:</small><br />
          {/if}
          <strong>{$siteUser?.name ?? "User"}</strong>
        </div>
        {#if !runningRefresh}
          <div class="flex flex-col justify-center ml-auto">
            <Button onclick={logout} class="w-full">
              {$_t("Sign out")}
            </Button>
          </div>
        {/if}
      </div>
    </Card>
  {:else}
    <Card class="p-4 sm:p-6 md:p-8">
      <form class="flex flex-col space-y-6">
        <div class="flex align-middle items-center">
          <ContentHeader
            content={[
              { content: "Sign in to " },
              {
                content: page.data.config.siteName
                  ? page.data?.config?.siteName
                  : "Similie",
                color: "primary",
                a: "/",
              },
            ]}
          />
          {#if page.data.config.publicSite}
            <div class="ml-auto">
              <a
                href="/account/forgot-password"
                class="text-primary-700 hover:underline dark:text-primary-500 text-sm"
              >
                {$_t("Forgot Password")}
              </a>
            </div>
          {/if}
        </div>

        {#if processing}
          <div class="place-self-center">
            {$_t("Please Wait")}
            <Spinner class="me-3" size="4" />
          </div>
        {:else}
          <Label class="space-y-2">
            <span>{$_t("Email or Username")}</span>
            <Input
              type="text"
              name="email"
              placeholder="name@similie.com"
              bind:value={identifier}
              required
            />
          </Label>
          <Label class="space-y-2">
            <span>{$_t("Password")}</span>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              bind:value={password}
              onkeydown={handleSubmit}
              required
            />
          </Label>
          <Button
            type="button"
            disabled={clickNotReady}
            onclick={login}
            class="w-full"
          >
            {$_t("Login to your account")}</Button
          >
          <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            {#if page.data.config.publicSite}
              <div class="flex-grow">
                {$_t("Not Registered")}
                <a
                  href="/account"
                  class="text-primary-700 hover:underline dark:text-primary-500"
                >
                  {$_t("Create an account")}
                </a>
              </div>
            {/if}
          </div>
        {/if}
      </form>
    </Card>
  {/if}
</SimpleBody>
