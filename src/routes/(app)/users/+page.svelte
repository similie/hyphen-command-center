<script lang="ts">
  import { page } from "$app/state";
  import {
    BasicModelPage,
    BodyContainer,
    HeaderContentWrapper,
  } from "$layouts";
  import { Button } from "flowbite-svelte";
  import { _t, type UserModel } from "$lib";
  import {
    AdminUserTable,
    CreatePopOutDetails,
    Navbar,
    PopoutInfo,
  } from "$components";
  import { PlusOutline } from "flowbite-svelte-icons";
  import UserAccountForm from "$components/user/UserAccountForm.svelte";
  let openDrawer = $state(true);
  let reload = $state<(() => void) | undefined>(undefined);
  const openKeyDrawer = async () => {
    openDrawer = !openDrawer;
  };

  const addedUser = (user: UserModel) => {
    if (!page.data.users) {
      page.data.users = [];
    }
    page.data.users.unshift(user);
    page.data.count = (page.data.count || 0) + 1;
    reload && reload();
  };
</script>

<BasicModelPage bind:openDrawer>
  {#snippet header()}
    <CreatePopOutDetails
      name="User Accounts"
      message="You can add students and contributors to this portal."
    />
  {/snippet}

  {#snippet body()}
    <HeaderContentWrapper>
      <UserAccountForm autoClear={true} oncomplete={addedUser} />
    </HeaderContentWrapper>
  {/snippet}

  {#snippet bodyContent()}
    <BodyContainer width={7}>
      <AdminUserTable
        bind:reload
        users={page.data.users}
        count={page.data.count}
        limit={page.data.limit}
      />
    </BodyContainer>
  {/snippet}

  {#snippet headerContent()}
    <Navbar title="User Accounts">
      {#snippet createSection()}
        <Button onclick={openKeyDrawer}
          >{$_t("Add User")} <PlusOutline /></Button
        >
      {/snippet}
    </Navbar>
  {/snippet}
</BasicModelPage>
