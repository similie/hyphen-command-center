<script lang="ts">
  import {
    BasicModelPage,
    BodyContentWrapper,
    HeaderContentWrapper,
  } from "$layouts";
  import { Button } from "flowbite-svelte";
  import { _t, siteUser, UserRoles, type FormModel } from "$lib";
  import {
    CreateFormElement,
    CreatePopOutDetails,
    ListForms,
    Navbar,
    Toast,
  } from "$components";
  import { PlusOutline } from "flowbite-svelte-icons";
  import Nav from "./Nav.svelte";

  let openDrawer = $state(true);
  let change = $state<(() => void) | undefined>(undefined);
  //   let reload = $state<(() => void) | undefined>(undefined);
  const openKeyDrawer = async () => {
    openDrawer = !openDrawer;
  };

  const onAction = (form: FormModel) => {
    openDrawer = true;
    Toast.success($_t(`Form "${form.name}" created successfully!`));
    change && change();
  };
</script>

{#snippet header()}
  <div slot="header" class="w-full">
    <CreatePopOutDetails
      name="Forms"
      message="You can create a new form for future applications or system uses"
    />
  </div>
{/snippet}

{#snippet body()}
  <div slot="header">
    <HeaderContentWrapper>
      <CreateFormElement {onAction} />
    </HeaderContentWrapper>
  </div>
{/snippet}

{#snippet bodyContent()}
  <BodyContentWrapper>
    <ListForms bind:onChange={change} />
  </BodyContentWrapper>
{/snippet}

{#snippet createSection()}
  <Nav />
  {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
    <Button onclick={openKeyDrawer} size="sm" class="hidden md:inline-flex"
      >{$_t("Add Form")} <PlusOutline /></Button
    >
  {/if}
{/snippet}

{#snippet headerContent()}
  <Navbar title="Forms" {createSection}></Navbar>
{/snippet}

<BasicModelPage {header} {body} {headerContent} {bodyContent} bind:openDrawer />
