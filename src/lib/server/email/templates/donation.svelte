<script lang="ts">
  import {
    Text,
    Button,
    Html,
    Container,
    Body,
    Head,
    Heading,
  } from "svelte-email-tailwind";
  import type { UserModel, DonationModel, SiteConfig } from "$lib/types";
  export let user: UserModel;
  export let donation: DonationModel;
  export let config: SiteConfig;
  export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html lang="en">
  <Head />
  <Body>
    <Container>
      <Heading class="text-amber-600 text-2xl"
        >{user.name || "Similie User"},</Heading
      >
      <Text
        >{"Thank you for your contribution to" +
          " " +
          (config?.siteName || "Similie Services")}.</Text
      >

      <Text>
        Your support goes a long way in helping us provide quality education and
        resources to our Students in Timor. We sincerely appreciate your
        generosity and commitment to our cause.
      </Text>

      <Text>
        Your donation: {config.currencySymbol}{(
          (donation.amount - donation.cost) /
          (config.currencyDivisor || 100)
        ).toFixed(2)}
        {donation.currency} has been successfully processed.
      </Text>
      <Text>
        Visit your account to view your donation history and to learn about the
        lives your contributions have impacted.
      </Text>
      <Button class="bg-amber-600 p-2 rounded-2xl text-[#fff]" {href}
        >{"Visit Now"}</Button
      >
    </Container>
  </Body>
</Html>
