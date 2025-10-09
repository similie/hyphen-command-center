<script lang="ts">
  import {
    Text,
    Button,
    Html,
    Img,
    Body,
    Head,
    Heading,
    Container,
  } from "svelte-email-tailwind";
  import type {
    UserModel,
    //  SiteConfig,
    CartInvoice,
    StudentRegistrationModel,
    CourseRegistrationModel,
    SpacesModel,
    SiteConfig,
  } from "$lib/types";
  import { appFileBase } from "$lib/utils";

  export let user: UserModel;
  export let invoice: CartInvoice | null = null;
  export let courses: StudentRegistrationModel[];
  export let config: SiteConfig;
  export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html lang="en">
  <Head></Head>

  <Body>
    <Container>
      <Heading class="text-amber-600 text-2xl"
        >{user.name || "Similie User"}</Heading
      >

      <Text
        >We are sending you this email to inform you that following registered
        courses have been dropped</Text
      >

      {#if invoice}
        <Text>Reason:</Text>
        <Text class="text-red-600"
          >Your unpaid invoice has expired: {invoice.invoice}</Text
        >
      {/if}
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="border-collapse: collapse; width: 100%;"
      >
        <thead>
          <tr>
            <th
              style="text-align: left; padding: 4px 4px; border-bottom: 1px solid #ddd;"
              ><Text>Mascot</Text></th
            >
            <th
              style="text-align: left; padding: 4px 4px; border-bottom: 1px solid #ddd;"
              ><Text>Name</Text></th
            >
          </tr>
        </thead>
        <tbody>
          {#each courses as registration}
            {@const cr = registration?.course as CourseRegistrationModel}
            {@const space = cr?.space as SpacesModel}
            {#if space}
              <tr class="table-row">
                <td style="padding: 4px 4px; vertical-align: top;">
                  {#if !space.image}
                    <Img
                      width="60"
                      height="100%"
                      alt={space.name}
                      src={href + "/favicon.png"}
                    />
                  {:else}
                    <Img
                      width="60"
                      height="100%"
                      alt={space.name}
                      src={href + appFileBase(space.image, "xs")}
                    />
                  {/if}
                </td>
                <td style="padding: 4px 4px; vertical-align: top;">
                  <Text class="break-words">{space.name}</Text>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>

      <Text>
        Please visit us a the Academy or the My Academy of on our student portal
        for more details.
      </Text>

      <Button class="bg-amber-600 p-2 rounded-2xl text-[#fff]" {href}
        >Visit Now</Button
      >
    </Container>
  </Body>
</Html>
