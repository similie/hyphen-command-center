<script lang="ts">
  import type { SiteConfig, StudentTuitionJoined, UserModel } from "$lib/types";
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
  export let tuitionJoined: StudentTuitionJoined;
  export let config: SiteConfig;
  export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html>
  <Head />

  <Body>
    <Container>
      <Heading class="text-amber-600 text-2xl"
        >{user.name || "Similie User"}, we received a payment for your {tuitionJoined
          .period?.name || "current"} registration period</Heading
      >

      {#if tuitionJoined.tuition.fullyPaid}
        <Text class="text-green-600">Your balance has been fully paid</Text>
      {:else}
        <Text>Your remaining balance is now:</Text>
        <Text class="text-amber-600 font-bold">
          Total: {config.currencySymbol}{tuitionJoined.tuition.amount.toFixed(
            2,
          )}
        </Text>
      {/if}

      <Text>
        {#if tuitionJoined.tuition.fullyPaid}
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
