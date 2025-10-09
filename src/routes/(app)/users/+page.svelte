<script lang="ts">
  import { page } from "$app/state";
  import { BasicModelPage } from "$layouts";
  import { Button } from "flowbite-svelte";
  import { _t, type UserModel } from "$lib";
  import { AdminUserTable, Navbar, PopoutInfo } from "$components";
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
    <div class="w-full flex items-center mx-5">
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400 w-full"
      >
        <PopoutInfo
          message="You can add students and contributors to the academy to in this portal."
        />

        {$_t("User Accounts")}
      </h5>
    </div>
  {/snippet}

  {#snippet body()}
    <div class=" flex items-center justify-center w-full">
      <div class="flex-grow w-full max-w-3xl p-6">
        <UserAccountForm autoClear={true} oncomplete={addedUser} />
      </div>
    </div>
  {/snippet}

  {#snippet bodyContent()}
    <div class="flex w-full p-6 flex-grow max-h-[calc(100vh-8rem)]">
      <div class="grow max-w-7xl mx-auto">
        <AdminUserTable
          bind:reload
          users={page.data.users}
          count={page.data.count}
          limit={page.data.limit}
        />
      </div>
    </div>
    <!-- <pre>{JSON.stringify(page.data, null, 2)}</pre> -->
  {/snippet}

  {#snippet headerContent()}
    <Navbar title="User Accounts">
      {#snippet createSection()}
        <Button onclick={openKeyDrawer} size="sm" class="hidden md:inline-flex"
          >{$_t("Add User")} <PlusOutline /></Button
        >
      {/snippet}
    </Navbar>
  {/snippet}
</BasicModelPage>
