<script lang="ts">
  import type {
    SiteConfig,
    StudentTuitionJoined,
    StudentTuitionModel,
    StudentTuitionPaymentsModel,
    UserModel,
  } from "$lib/types";
  import {
    Body,
    Head,
    Html,
    Heading,
    Text,
    Button,
    Container,
  } from "svelte-email-tailwind";
  export let user: UserModel;
  export let tuition: StudentTuitionModel;
  export let payment: StudentTuitionPaymentsModel;
  export let config: SiteConfig;
  export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html>
  <Head />

  <Body>
    <Container>
      <Heading class="text-amber-600 text-2xl"
        >{user.name || "Similie User"}, we received a payment toward your
        tuition</Heading
      >

      {#if payment.fullyPaid}
        <Text class={"text-green-700"}
          >Your payment of {config.currencySymbol}{payment.appliedValue.toFixed(
            2,
          )}</Text
        >
      {:else}
        <Text class={"text-orange-400"}
          >Your payment of {config.currencySymbol}{payment.appliedValue.toFixed(
            2,
          )}</Text
        >
      {/if}

      {#if tuition.fullyPaid}
        <Text class="text-green-600">Your balance has now been fully paid</Text>
      {:else}
        <Text>Your remaining balance is now:</Text>
        <Text class="text-amber-600 font-bold">
          Total: {config.currencySymbol}{tuition.amount.toFixed(2)}
        </Text>
      {/if}

      <Text>
        {#if tuition.fullyPaid}
          We at the Academy, thank you for your payment and in your support for
          helping make The Impossible, Possible
        {:else}
          We at the Academy, thank you for your payment.
        {/if}
      </Text>

      <Button class="bg-amber-600 p-2 rounded-2xl text-[#fff]" {href}
        >Visit My Academy</Button
      >
    </Container>
  </Body>
</Html>
