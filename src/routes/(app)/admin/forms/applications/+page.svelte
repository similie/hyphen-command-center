<script lang="ts">
  import {
    BasicModelPage,
    BodyContentWrapper,
    HeaderContentWrapper,
  } from "$layouts";
  import { Button } from "flowbite-svelte";
  import { _t, siteUser, UserRoles, type ApplicationModel } from "$lib";
  import {
    CreateApplicationModel,
    CreatePopOutDetails,
    Navbar,
    SystemApplicationList,
    Toast,
  } from "$components";
  import { PlusOutline } from "flowbite-svelte-icons";
  import Nav from "../Nav.svelte";
  let change = $state<(() => void) | undefined>(undefined);
  let openDrawer = $state(true);
  const openKeyDrawer = async () => {
    openDrawer = !openDrawer;
  };

  const onAction = () => {
    openDrawer = true;
    Toast.success($_t("Form created successfully!"));
    change?.();
  };
</script>

{#snippet header()}
  <div slot="header" class="w-full">
    <CreatePopOutDetails
      name="Applications"
      message="You can create a new applications for complex data collection workflows"
    />
  </div>
{/snippet}

{#snippet body()}
  <div slot="header">
    <HeaderContentWrapper>
      <CreateApplicationModel {onAction} />
    </HeaderContentWrapper>
  </div>
{/snippet}

{#snippet bodyContent()}
  <BodyContentWrapper>
    <SystemApplicationList bind:onChange={change} />
  </BodyContentWrapper>
{/snippet}

{#snippet createSection()}
  <Nav />

  {#if $siteUser && $siteUser.role >= UserRoles.USER_MANAGER}
    <Button onclick={openKeyDrawer} size="sm" class="hidden md:inline-flex"
      >{$_t("Add Application")} <PlusOutline /></Button
    >
  {/if}
{/snippet}

{#snippet headerContent()}
  <Navbar title="Applications" {createSection}></Navbar>
{/snippet}

<BasicModelPage {header} {body} {headerContent} {bodyContent} bind:openDrawer />
