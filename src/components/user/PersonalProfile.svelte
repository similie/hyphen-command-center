<script lang="ts">
  import { Modal, Button, Spinner } from "flowbite-svelte";
  import { _t, siteUser } from "$lib";
  import { AvatarBuilder, PersonalProfileForm } from "$components";
  let { open = $bindable() } = $props<{ open: boolean }>();
  let currentPage = "Profile";
  let saveModel = $state($siteUser);
  let saving = $state(false);
  let dirty = $state(false);
  let disabled = $state(false);
  let disabledForm = $state(false);

  let formAction: (() => void | Promise<void>) | undefined = $state(undefined);
  const saveChanges = async () => {
    // we do this because we are going to have tabbed pages
    // with user config available in the future
    if (formAction && currentPage === "Profile") {
      return formAction();
    }
  };
</script>

{#if saveModel}
  <Modal bind:open>
    {#snippet header()}
      <div class="flex space-x-2 items-center align-center w-full">
        <AvatarBuilder
          bind:disabled={disabledForm}
          bind:avatar={saveModel!.avatar}
          onavatar={() => {
            dirty = true;
          }}
        />
        <div>
          {$_t("Profile") + " " + saveModel?.name}
        </div>
      </div>
    {/snippet}

    <!-- @todo add tabs and additional pages -->
    {#if currentPage === "Profile"}
      <PersonalProfileForm
        bind:dirty
        bind:disabledForm
        bind:disabled
        bind:action={formAction}
        bind:model={saveModel}
      />
    {/if}

    {#snippet footer()}
      <div class="flex w-full">
        <Button class="w-full" {disabled} onclick={saveChanges}>
          {#if saving}
            <Spinner size="6" />
          {:else}
            {$_t("Save")}
          {/if}
        </Button>
      </div>
    {/snippet}
  </Modal>
{/if}
