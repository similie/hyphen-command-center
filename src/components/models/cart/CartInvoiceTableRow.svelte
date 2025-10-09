<script lang="ts">
  import { UserAvatar } from "$components";
  import { type CartItem, siteConfig } from "$lib";
  import { TableBodyCell, TableBodyRow, P } from "flowbite-svelte";

  let { item } = $props<{ item: CartItem }>();
  let total = $derived(Math.round((item.price * item.qty * 100) / 100));
</script>

<TableBodyRow>
  <TableBodyCell>
    <UserAvatar avatar={item.image} />
  </TableBodyCell>
  <TableBodyCell>
    <P>{item.name}</P>
  </TableBodyCell>
  <TableBodyCell>
    <P>{item.qty}</P>
  </TableBodyCell>
  <TableBodyCell>
    <P>{$siteConfig.currencySymbol}{item.price}</P>
  </TableBodyCell>

  <TableBodyCell>
    <P>{$siteConfig.currencySymbol}{total}</P>
  </TableBodyCell>
</TableBodyRow>
