<script lang="ts">
  import { SimpleBody } from "$layouts";
  import { Heading, Card, Spinner, Button } from "flowbite-svelte";
  import { _t, formatMessageServerMessage, UserApi } from "$lib";
  import { NavBranding, PasswordInput, Toast } from "$components";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  const api = new UserApi();
  let password = $state("");
  let formElement = $state<HTMLFormElement | null>(null);
  let disabled = $state(true);
  let sending = $state(false);
  const onInput = (event: KeyboardEvent) => {
    if (disabled || event.key !== "Enter") {
      return;
    }
    changePassword();
  };
  const onKeyup = () => {
    disabled = !formElement?.checkValidity();
  };

  const sendChange = () => {
    if (!password || password.length < 8) {
      throw new Error("Invalid Password");
    }
    sending = true;
    return api.resetPublicUserPassword(page.data.token, password);
  };
  const changePassword = async () => {
    try {
      const res = await sendChange();
      if (res.ok) {
        Toast.success($_t("Password Changed"));
        goto("/");
      } else if (res.message) {
        Toast.error(formatMessageServerMessage(res.message));
      }
    } catch (e: any) {
      Toast.error(formatMessageServerMessage(e.message));
    } finally {
      sending = false;
    }
  };
</script>

<SimpleBody>
  <Card class="p-4 sm:p-6 md:p-8">
    <div class="flex justify-center items-center mb-4">
      <NavBranding />
      <div class="ml-auto">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">
          {$_t("Password Reset")}
        </h3>
        <!-- <Heading class="ml-auto" tag="h5">{$_t("Password Reset")}</Heading> -->
      </div>
    </div>
    <form bind:this={formElement}>
      <PasswordInput
        required={true}
        onkeydown={onInput}
        onkeyup={onKeyup}
        minCharacters={8}
        bind:password
        disabled={sending}
      />
    </form>
    <Button
      class="w-full mt-4"
      color={"alternative"}
      {disabled}
      onclick={changePassword}
    >
      {#if !sending}
        {$_t("Send Password Change")}
      {:else}
        {$_t("Sending...")} <Spinner class="ms-2" size="4" />
      {/if}
    </Button>
  </Card>
</SimpleBody>
