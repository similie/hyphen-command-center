<script lang="ts">
  import {
    type CartInvoice,
    UserRoles,
    _t,
    siteConfig,
    siteUser,
  } from "$lib";
  import {
    AccordionItem,
    Badge,
    Button,
    Hr,
    Label,
    P,
    Span,
    Spinner,
  } from "flowbite-svelte";
  import CartInvoiceTable from "./CartInvoiceTable.svelte";
  import DateFormat from "$components/content/DateFormat.svelte";
  import DestroyModelModal from "../destroy/DestroyModelModal.svelte";
  import { Toast } from "$components/toasts";
  let showInvoiceReady = $state(false);
  let showScholarshipApplied = $state(false);
  let loading = $state(false);

  let {
    invoice: invoiceModel = $bindable(),
    scholarships = $bindable(),
    edit = true,
  } = $props<{
    invoice: CartInvoice;
    edit?: boolean;
  }>();

  let invoice = $state<CartInvoice>(invoiceModel);

  const sendPayment = async (scholarship = false) => {
    try {

      Toast.success("Successfully processed payment");
    } catch (e) {
      console.error(e);
      Toast.error($_t("Failed to process payment"));
    } finally {
      loading = false;
    }
  };

  const onConfirmedScholarship = () => {
    return sendPayment(true);
  };

  const onConfirmedInvoice = () => {
    return sendPayment();
  };

  let isAdmin = $derived(
    ($siteUser?.role || UserRoles.BLOCKED) >= UserRoles.USER_MANAGER,
  );
</script>

{#if showScholarshipApplied}
  <DestroyModelModal
    bind:open={showScholarshipApplied}
    title={$_t("Confirm Scholarship Acceptance")}
    body={$_t(
      "By selecting this payment open, you confirm that the student has actively accepted the scholarship as payment. You understand that user details are captured and that the account balance will match our records. Any violation will result in termination.",
    )}
    btnColor={"primary"}
    btnText={$_t("I confirm scholarship acceptance")}
    onDestroy={onConfirmedScholarship}
  >
  </DestroyModelModal>
{/if}

{#if showInvoiceReady}
  <DestroyModelModal
    bind:open={showInvoiceReady}
    title={$_t("Confirm Payment Recept")}
    body={$_t(
      "By selecting this payment, you confirm that you have actively taken payment for this transaction. You understand that user details are captured and that the account balance will match our records. Any violation will result in termination. Payments are non-refundable",
    )}
    btnColor={"primary"}
    btnText={$_t("I confirm that valid payment")}
    onDestroy={onConfirmedInvoice}
  >
  </DestroyModelModal>
{/if}

<AccordionItem>
  {#snippet header()}
    <div class="flex w-full flex-wrap md:flex-nowrap">
      <h5 class="font-semibold">{$_t("Invoice ID")}: {invoice.invoice}</h5>
      <div class="md:ml-auto md:mr-16">
        <DateFormat stamp={invoice.created_at} format="date" />
        {$_t("Total")}: <Span
          class={invoice.paid ? "text-green-600" : "text-primary-600"}
          >{$siteConfig.currencySymbol}{invoice.total}</Span
        >
      </div>
    </div>
  {/snippet}

  <div class="flex w-full">
    <div class="flex space-x-2 items-center">
      <Label>{$_t("Status")}:</Label>
      <Badge color={invoice.paid ? "green" : "red"}
        >{invoice.paid ? $_t("Paid") : $_t("Unpaid")}</Badge
      >
    </div>

    {#if !invoice.paid && !loading}
      <div class="ml-auto flex items-center space-x-2">

        {#if edit && isAdmin}
          <Button
            onclick={() => (showInvoiceReady = true)}
            class="ml-auto"
            size="sm"
            color="primary">{$_t("Pay Invoice")}</Button
          >
        {/if}
      </div>
    {:else if loading}
      <div class="ml-auto flex items-center space-x-2">
        <P>{$_t("Processing... ")}</P>
        <Spinner />
      </div>
    {/if}
  </div>

  <Hr class="my-2" />

  <CartInvoiceTable {invoice} />
</AccordionItem>
