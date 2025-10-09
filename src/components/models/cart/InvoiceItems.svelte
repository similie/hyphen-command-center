<script lang="ts">
    import { type CartInvoice, _t } from "$lib";
    import { Accordion, P } from "flowbite-svelte";
    import InvoiceItemsRows from "./InvoiceItemsRows.svelte";

    let { invoices = $bindable(), edit = true } = $props<{
        invoices: CartInvoice[];
        edit?: boolean;
    }>();
</script>

{#if invoices.length === 0}
    <P class="text-center">{$_t("No invoices found")}.</P>
{:else}
    <Accordion flush>
        {#each invoices as _, index}
            <InvoiceItemsRows bind:invoice={invoices[index]} {edit} />
        {/each}
    </Accordion>
{/if}
