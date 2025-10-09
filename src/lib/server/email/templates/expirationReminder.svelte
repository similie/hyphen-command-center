<script lang="ts">
  import {
    Text,
    Button,
    Html,
    Img,
    Body,
    Head,
    Heading,
    Preview,
  } from "svelte-email-tailwind";
  import type { UserModel, SiteConfig, CartInvoice } from "$lib/types";
  import { appFileBase } from "$lib/utils";

  export let user: UserModel;
  export let invoice: CartInvoice;
  export let config: SiteConfig;
  export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html lang="en">
  <Head></Head>
  <Preview preview="Academy Invoice" />

  <Body>
    <Heading class="text-amber-600 text-2xl"
      >{user.name || "Similie User"}, your invoice is ready</Heading
    >

    <Text>We are sending you a reminder</Text>

    <Text>Your invoice is about to expire: {invoice.invoice}</Text>

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
          <th
            style="text-align: left; padding: 4px 4px; border-bottom: 1px solid #ddd;"
            ><Text>Price</Text></th
          >
          <th
            style="text-align: left; padding: 4px 4px; border-bottom: 1px solid #ddd;"
            ><Text>Quantity</Text></th
          >
        </tr>
      </thead>
      <tbody>
        {#each invoice.items as item}
          <tr class="table-row">
            <td style="padding: 4px 4px; vertical-align: top;">
              {#if !item.image}
                <Img
                  width="60"
                  height="100%"
                  alt={item.name}
                  src={href + "/favicon.png"}
                />
              {:else}
                <Img
                  width="60"
                  height="100%"
                  alt={item.name}
                  src={href + appFileBase(item.image, "xs")}
                />
              {/if}
            </td>
            <td style="padding: 4px 4px; vertical-align: top;">
              <Text class="break-words">{item.name}</Text>
            </td>
            <td style="padding: 4px 4px; vertical-align: top;">
              <Text>
                {config.currencySymbol}{item.price.toFixed(2)}
              </Text>
            </td>
            <td style="padding: 4px 4px; vertical-align: top;">
              <Text>{item.qty}</Text>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <Text>
      Total: {config.currencySymbol}{invoice.total.toFixed(2)}
    </Text>

    <Text>
      {#if invoice.paid}
        Thank you for your payment.
      {:else}
        Your payment is still pending. You courses will be automatically dropped
        with 24 hours.
      {/if}
    </Text>

    <Button class="bg-amber-600 p-2 rounded-2xl text-[#fff]" {href}
      >Visit Now</Button
    >
  </Body>
</Html>
