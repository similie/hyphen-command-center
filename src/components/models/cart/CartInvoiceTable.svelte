<script lang="ts">
  import { type CartInvoice, _t, siteConfig } from "$lib";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
    TableBodyCell,
    P,
  } from "flowbite-svelte";
  import CartInvoiceTableRow from "./CartInvoiceTableRow.svelte";

  let { invoice, class: className } = $props<{
    invoice: CartInvoice;
    class?: string;
  }>();
</script>

<Table shadow class={className}>
  <TableHead>
    <TableHeadCell>{$_t("Image")}</TableHeadCell>
    <TableHeadCell>{$_t("Name")}</TableHeadCell>
    <TableHeadCell>{$_t("Quantity")}</TableHeadCell>
    <TableHeadCell>{$_t("Price")}</TableHeadCell>
    <TableHeadCell>{$_t("Total")}</TableHeadCell>
  </TableHead>

  <TableBody>
    {#each invoice.items as item}
      <CartInvoiceTableRow {item} />
    {/each}
  </TableBody>

  <TableBody>
    <TableHeadCell colspan={4} class="text-right">
      {$_t("Subtotal")}
    </TableHeadCell>
    <TableBodyCell>
      <P>{$siteConfig.currencySymbol}{invoice.total}</P>
    </TableBodyCell>
  </TableBody>
</Table>
