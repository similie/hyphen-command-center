<script lang="ts">
  import { type SiteConfig } from "$lib";
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
        Please click the verification link below to continue registration.
      </Text>

      <Button class="bg-cyan-600 p-2 rounded-2xl text-[#fff]" {href}
        >{"Verify Now"}</Button
      >

      <Text>
        If you did not request a verification, please ignore this email. You can
        also contact us at{" "}
        <Button href="mailto:info@similie.org">Similie Support</Button>.
      </Text>
    </Container>
  </Body>
</Html>
