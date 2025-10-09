<script lang="ts">
  import { type LicenseAgreementModel, type Registration, _t } from "$lib";
  import { Modal, Button } from "flowbite-svelte";
  import { MarkdownContentRender } from "../markdown";
  let {
    open = $bindable(),
    registration,
    licenseAgreement,
    onAccept,
    onClose,
    contentOnly = false,
  } = $props<{
    open: boolean;
    registration?: Partial<Registration>;
    licenseAgreement: LicenseAgreementModel;
    onAccept?: (reg: Partial<Registration>) => void;
    onClose?: () => void;
    contentOnly?: boolean;
  }>();
</script>

<Modal
  autoclose={false}
  outsideclose={false}
  dismissable={contentOnly || false}
  title={$_t("Terms of Service")}
  bind:open
>
  <MarkdownContentRender content={licenseAgreement.content} />

  {#snippet footer()}
    {#if !contentOnly}
      <Button
        onclick={() => {
          open = false;
          onClose && onClose();
        }}
        color="alternative">{$_t("Decline")}</Button
      >
      <Button class="ml-auto" onclick={() => onAccept && onAccept(registration)}
        >{$_t("I accept")}</Button
      >
    {/if}
  {/snippet}
</Modal>
