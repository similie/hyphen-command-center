<script lang="ts">
  import { siteConfig, type UserModel, _t, type IDevice } from "$lib";
  import QrCode from "@castlenine/svelte-qrcode";
  import { Button, Modal, A, Toggle } from "flowbite-svelte";

  let { device, size = 200 } = $props<{ device: IDevice; size?: number }>();

  const baseUrl = `${$siteConfig.applicationApi}/devices/${device.id}`;
  let open = $state(false);

  // whether to include the name under the QR code
  let includeName = $state(false);

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
          <title>${device?.identity}</title>
          <style>
            /* ensure the QR & name are centered */
            @page {
                size: auto;
                margin: 2mm;
            }
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                text-align: center;
                font-family: "Helvetica", "Arial", sans-serif; /* non-serif */
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            #printable {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                line-height: 0;
                box-sizing: border-box;
            }
            p {
                margin: 0;
                line-height: 1.1;
                font-size: 10pt;
            }
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

<Modal bind:open title={device.name}>
  <!-- this div will show up in the print preview -->
  <div id="printable" class="flex flex-col items-center justify-center">
    <QrCode
      data={baseUrl}
      logoPath="/similie.png"
      {size}
      haveBackgroundRoundedEdges
    />
    {#if includeName}
      {#if device.name}
        <p class="font-semibold">{device.name}</p>
      {/if}
      <p class="font-semibold">{device.identity}</p>
      <p class="font-semibold">Hyphen Elemental 4</p>
    {/if}
  </div>

  <p class="text-center text-gray-500 mt-4">
    {$_t(`Scan this QR code to access the device profile of ${device.name}`)}
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
      {$_t("Print Identity")}
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
