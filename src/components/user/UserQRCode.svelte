<script lang="ts">
  import { siteConfig, type UserModel, _t } from "$lib";
  import QrCode from "@castlenine/svelte-qrcode";
  import { Button, Modal, A, Toggle } from "flowbite-svelte";

  export let user: UserModel;
  export let size: number = 200;

  const baseUrl = `${$siteConfig.applicationApi}/profile/${user.uid}`;
  let open = false;

  // whether to include the name under the QR code
  let includeName = false;

  // prints just the #printable section
  function printContent() {
    const printable = document.getElementById("printable");
    if (!printable) return;

    // open a new window
    const printWindow = window.open("", "_blank", "width=600,height=600");
    if (!printWindow) return;

    // write a minimal HTML page with the printable content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            /* ensure the QR & name are centered */
            body { 
              margin: 0; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              flex-direction: column;
              height: 100vh;
            }
            #printable { text-align: center; }
            /* prevent page margins cutting off content */
            @page { margin: 1cm; }
          </style>
        </head>
        <body>
          ${printable.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // delay to ensure rendering
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 200);
  }
</script>

<Modal bind:open title={user.name}>
  <!-- this div will show up in the print preview -->
  <div id="printable" class="flex flex-col items-center justify-center p-4">
    <QrCode
      anchorsOuterColor="#fe795d"
      anchorsInnerColor="#ef562f"
      data={baseUrl}
      logoPath="/similie.png"
      {size}
      haveBackgroundRoundedEdges
    />
    {#if includeName}
      <p class="mt-3 text-lg font-semibold">{user.name}</p>
    {/if}
  </div>

  <p class="text-center text-gray-500 mt-4">
    {$_t(`Scan this QR code to access the profile of ${user.name}`)}
  </p>
  <p class="text-center text-gray-500 mt-2">
    {$_t("You can also access it at the following ")}
    <A href={baseUrl} target="_blank" rel="noopener noreferrer">
      {$_t("link")}
    </A>
  </p>

  <div class="flex justify-center mt-4 space-x-4">
    <Button color="primary" size="sm" onclick={printContent}>
      {$_t("Print QR Code")}
    </Button>
    <Toggle bind:checked={includeName}>
      {$_t("Print Name")}
    </Toggle>
  </div>
</Modal>

<Button color="alternative" size="sm" onclick={() => (open = true)}>
  <QrCode logoPath="/similie-sm.png" data={baseUrl} size={24} />
</Button>

<style>
  /* hide everything except #printable when printing from this window */
  @media print {
    /* body * {
      visibility: hidden;
    } */
    #printable,
    #printable * {
      visibility: visible;
    }
    #printable {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
  }
</style>
