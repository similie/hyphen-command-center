<script lang="ts">
  import { BasicModelPage } from "$layouts";
  import { Button } from "flowbite-svelte";
  import {
    _t,
    siteUser,
    UserRoles,
    type CartInvoice,
    type StudentScholarshipModel,
    type UserModel,
    type StudentTabSelect,
    type DonationTypeCount,
  } from "$lib";
  import {
    DonationCreateForm,
    DonationTable,
    Navbar,
    PopoutInfo,
    StudentRegistrationDetails,
    Toast,
    UserProfileDetails,
  } from "$components";
  import { PlusOutline } from "flowbite-svelte-icons";

  let { data } = $props<{
    data: {
      user: UserModel;
      invoices: CartInvoice[];
      scholarships: StudentScholarshipModel[];
      donations: number;
      donationTypeCounts: DonationTypeCount[];
    };
  }>();
  let selectedTab = $state<StudentTabSelect>("courses");
  let openDrawer = $state(true);
  const openKeyDrawer = async () => {
    openDrawer = !openDrawer;
  };

  const onCreate = () => {
    openDrawer = true;
    Toast.success($_t("Donation created successfully!"));
  };

  const onTabSet = (tab: StudentTabSelect) => {
    selectedTab = tab;
  };
</script>

<BasicModelPage bind:openDrawer>
  {#snippet header()}
    <div class="w-full flex items-center mx-5">
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400 w-full"
      >
        <PopoutInfo message="You can add a donation value from the user." />

        {$_t("User Donations")}
      </h5>
    </div>
  {/snippet}

  {#snippet body()}
    <div class=" flex items-center justify-center w-full">
      <div class="flex-grow w-full max-w-3xl p-6">
        <DonationCreateForm user={data.user} {onCreate} />
      </div>
    </div>
  {/snippet}

  {#snippet headerContent()}
    <Navbar title="User Profile">
      {#snippet createSection()}
        {#if $siteUser && $siteUser.role > UserRoles.GUEST && selectedTab === "donations"}
          <Button
            onclick={openKeyDrawer}
            size="sm"
            class="hidden md:inline-flex"
            >{$_t("Add Donation")} <PlusOutline /></Button
          >
        {/if}
      {/snippet}
    </Navbar>
  {/snippet}

  {#snippet bodyContent()}
    <div class="flex w-full p-6 flex-grow max-h-[calc(100vh-8rem)]">
      <div class="grow max-w-7xl mx-auto space-y-8">
        <div class="grid grid-cols-3 gap-3 w-full justify-center">
          <UserProfileDetails user={data.user} />
          <StudentRegistrationDetails edit content={data} {onTabSet} />
        </div>
        {#if data.donations && selectedTab === "donations"}
          <DonationTable user={data.user as UserModel} />
        {/if}
      </div>
    </div>
  {/snippet}
</BasicModelPage>
