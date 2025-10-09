<script lang="ts">
  import { ContentHeader, Toast } from "$components";
  import { SimpleBody } from "$layouts";
  import { _t, formatMessageServerMessage, UserApi } from "$lib";
  import { Button, Card, Heading, Input, A, P, Spinner } from "flowbite-svelte";
  import { AngleLeftOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  let identifier = $state("");
  let disabledState = $state(true);
  let sending = $state(false);
  let sent = $state(false);
  let formElement = $state<HTMLFormElement | null>(null);
  const api = new UserApi();
  const checkValidity = () => {
    const valid = formElement?.checkValidity();
    disabledState = typeof valid !== "undefined" ? !valid : true;
  };

  const sendReset = async () => {
    sending = true;
    try {
      const result = await api.setPasswordReset(identifier);
      sent = result.ok;
      if (result.message) {
        Toast.error(formatMessageServerMessage(result.message));
      }
    } catch (e) {
      console.error("Error sending password reset", e);
      sent = false;
    } finally {
      sending = false;
    }
  };

  onMount(() => {
    formElement?.identifier.focus();
  });
</script>

<SimpleBody>
  <Card class="p-4 sm:p-6 md:p-8">
    {#if !sent}
      <form class="flex flex-col space-y-4" bind:this={formElement}>
        <div class="flex">
          <ContentHeader content={[{ content: "Forgot Password" }]} />
          <A href="/signin" class="ml-auto"
            ><AngleLeftOutline /> {$_t("Back")}</A
          >
        </div>
        <Input
          type="text"
          class="text-center"
          id="identifier"
          placeholder="Username or Email address"
          required
          minlength={8}
          bind:value={identifier}
          disabled={sending}
          onkeyup={checkValidity}
        />
        <Button
          type="button"
          class="w-full"
          disabled={disabledState || sending}
          onclick={sendReset}
        >
          {#if !sending}
            {$_t("Send me the reset link")}
          {:else}
            {$_t("Sending...")} <Spinner class="ms-2" size="4" />
          {/if}
        </Button>
      </form>
      <P align="center" size="sm">
        Enter your email address or username and we will send a link to your to
        email reset your password.
      </P>
    {:else}
      <Heading tag="h4"
        >{$_t("The password change email has been sent")}</Heading
      >
      <Button class="mt-2" href="/">
        {$_t("Back to Home")}
      </Button>
    {/if}
  </Card>
</SimpleBody>
