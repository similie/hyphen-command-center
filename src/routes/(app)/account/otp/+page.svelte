<script lang="ts">
  import { SimpleBody } from "$layouts";
  import { Heading, Card, P, Button } from "flowbite-svelte";
  import { _t, UserApi } from "$lib";
  import { NavBranding, InputCode } from "$components";
  import { goto } from "$app/navigation";

  const CODE_SIZE = 5;
  const setTime = 60;
  const api = new UserApi();
  //   let value = $state("");
  let disabled = $state(false);
  let blockResendCode = $state(true);
  let error = $state(false);
  let clear = $state<(() => void) | undefined>(undefined);
  let timer = $state(setTime);
  let interval = $state<NodeJS.Timeout | null>(null);

  const resetInterval = () => {
    interval && clearInterval(interval);
    timer = setTime;
  };

  const runInterval = () => {
    interval = setInterval(() => {
      timer--;
      if (timer === 0) {
        resetInterval();
        blockResendCode = false;
      }
    }, 1000);
  };

  const validateCode = async (code: string) => {
    const valid = await api.validateOtp(code);
    if (valid.otp) {
      return;
    }
    throw new Error("Failed to validate OTP");
  };

  const onResend = async () => {
    if (blockResendCode) {
      return;
    }
    blockResendCode = true;
    clear && clear();
    await api.resendOtp();
    resetInterval();
    runInterval();
    console.log("Resending code...");
  };

  const onComplete = async (code: string) => {
    disabled = true;
    try {
      await validateCode(code);
      goto("/");
    } catch (e) {
      console.error(e);
      error = true;
    }
    disabled = false;
  };

  runInterval();
</script>

<SimpleBody>
  <Card class="p-4 sm:p-6 md:p-8">
    <div class="flex justify-center items-center mb-4">
      <NavBranding />
      <div class="ml-auto">
        <Heading class="ml-auto" tag="h5">{$_t("OTP Code")}</Heading>
      </div>
    </div>

    <P class="mb-4" align="center">{$_t("Check your email for the OTP code")}</P
    >
    <InputCode
      {error}
      {disabled}
      size={CODE_SIZE}
      {onComplete}
      bind:clear
      onChange={() => {
        error = false;
      }}
    />
    <Button
      class="w-full mt-4"
      color={"alternative"}
      disabled={blockResendCode || disabled}
      onclick={onResend}
      >{$_t("Resend OTP Code")}
      {timer >= 0 && blockResendCode ? `(${timer})` : ""}</Button
    >
  </Card>
</SimpleBody>
