<script lang="ts">
  import { type SiteConfig, _t } from "$lib";
  import {
    Text,
    Button,
    Html,
    Container,
    Body,
    Head,
    Heading,
  } from "svelte-email-tailwind";
  export let config: SiteConfig;
  export let name: string;
  export let href: string = config?.applicationURL || "https://similie.org";
</script>

<Html lang="en">
  <Head />
  <Body>
    <Container>
      <Heading class="text-cyan-500 text-2xl">{name || "Similie User"},</Heading
      >
      <Text
        >{"Thank you for using" +
          " " +
          (config?.siteName || "Similie Services")}.</Text
      >

      <Text>
        You have requested a password reset for your account. Click the link
        below to continue.
      </Text>

      <Button class="bg-cyan-600 p-2 rounded-2xl text-[#fff]" {href}
        >{"Update Now"}</Button
      >
    </Container>
  </Body>
</Html>
