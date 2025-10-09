<script lang="ts">
  import { SimpleBody } from "$layouts";
  import { page } from "$app/state";
  import {
    DynamicForm2,
    Toast,
    LicenseAgreement,
    ContentHeader,
  } from "$components";
  import {
    _t,
    extractFormToJson,
    formatMessageServerMessage,
    UserApi,
    validateEmail,
    type FormField,
    type LicenseAgreementModel,
    type Registration,
  } from "$lib";
  import { Card, Heading, Spinner, A, P, Button, Modal } from "flowbite-svelte";
  import { AngleLeftOutline } from "flowbite-svelte-icons";
  const api = new UserApi();
  let formData: any = {};
  let loading = $state(false);
  let emailSent = $state(false);
  let openLicenseAgreement = $state(false);
  let resendEmail = $state("");
  let registrationData = $state<Partial<Registration>>({});
  let licenseAgreement = $state<LicenseAgreementModel | null>(
    page.data.licenseAgreement,
  );
  const schema: FormField[] = [
    {
      name: "name",
      label: "Your Name",
      type: "text",
      value: "",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      value: "",
      required: true,
      validate: (value: string) => {
        return validateEmail(value);
      },
    },
  ];

  const startAccount = async (data: Partial<Registration>) => {
    try {
      loading = true;
      const valid = await api.validEmail(data.email!);
      if (!valid) {
        Toast.error("Invalid email address");
        return;
      }

      const started = await api.startAccount(data);
      emailSent = started.ok;
      if (!emailSent && started.message) {
        Toast.error(formatMessageServerMessage(started.message));
      }
      if (started.resend) {
        resendEmail = started.resend;
      }
    } catch (e: any) {
      console.error("Failed to generate email", e);
      Toast.error(formatMessageServerMessage(e.message));
    } finally {
      loading = false;
    }
  };

  const onSubmit = (form: FormData) => {
    registrationData = extractFormToJson(form);
    // const licenseAgreement = page.data.licenseAgreement;
    if (!licenseAgreement) {
      return startAccount(registrationData);
    }
    openLicenseAgreement = true;
  };

  const onAccept = (reg: Partial<Registration>) => {
    registrationData = reg;
    openLicenseAgreement = false;
    startAccount(registrationData);
  };

  const resend = async () => {
    const email = resendEmail;
    loading = true;
    try {
      const started = await api.resendVerificationEmail(email);
      resendEmail = "";
      emailSent = started.ok;
    } catch {
      console.error("Failed to resend email");
      Toast.error("Failed to resend verification email");
    } finally {
      loading = false;
    }
  };
</script>

{#if licenseAgreement}
  <LicenseAgreement
    registration={registrationData}
    {licenseAgreement}
    bind:open={openLicenseAgreement}
    {onAccept}
  />
{/if}

<SimpleBody>
  <Card class="p-4 sm:p-6 md:p-8">
    <div class="flex items-center">
      <ContentHeader
        content={[
          { content: "Your " },
          { content: page.data.config.siteName, color: "primary", a: "/" },
          { content: " account" },
        ]}
      />
      <A href="/signin" class="ml-auto mt-1" type="submit"
        ><AngleLeftOutline /> {$_t("SignIn")}</A
      >
    </div>
    {#if loading}
      <Heading tag="h6"
        >{$_t("Sending verification email")}
        <Spinner class="me-3" size="4" /></Heading
      >
    {:else if emailSent}
      <P
        >{$_t(
          "The verification email has been sent. To continue, please check your email.",
        )}
        <A href="/">{$_t("Home")}</A></P
      >
    {:else if resendEmail}
      <P
        >{$_t(
          "The verification email has been sent. Would you like to resend it?",
        )}
      </P>
      <Button onclick={resend} color="primary" class="mt-3"
        >{$_t("Resend Verification Email")}</Button
      >
    {:else}
      <DynamicForm2
        onsubmit={onSubmit}
        edit={true}
        fields={schema}
        cols={1}
        noClear
        sideLabels={false}
        model={formData}
        createBtnClass="w-full"
      ></DynamicForm2>
    {/if}
  </Card>
</SimpleBody>
