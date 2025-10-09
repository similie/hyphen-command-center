<script lang="ts">
  import {
    Text,
    Container,
    Html,
    Body,
    Head,
    Heading,
  } from "svelte-email-tailwind";

  export let passcode: string;
  export let expire: number = 5;
</script>

<Html>
  <Head />
  <Body>
    <Container>
      <Heading class="text-amber-600 text-2xl"
        >You're one-time passcode. Do not share this with anyone.</Heading
      >
      <Text style={{ fontWeight: 900 }}>{passcode}</Text>
      <Text>
        This code will expire in {expire} minutes. We hope you enjoy exploring the
        Academy.
      </Text>
    </Container>
  </Body>
</Html>
