<script lang="ts">
  import { page } from "$app/state";
  import { slide } from "svelte/transition";
  import { siteUser, _t, Debounce, UserApi } from "$lib";
  import {
    Sidebar,
    Button,
    NavBrand,
    DarkMode,
    SidebarWrapper,
    A,
    Heading,
    P,
    Popover,
  } from "flowbite-svelte";
  import {
    ArrowLeftToBracketOutline,
    ArrowRightToBracketOutline,
    UserOutline,
  } from "flowbite-svelte-icons";
  import SidebarItems from "./SidebarItems.svelte";
  import { NavBranding, PersonalProfile, UserAvatar } from "$components";
  import { cubicInOut } from "svelte/easing";
  import BuiltWithLove from "$components/content/BuiltWithLove.svelte";
  import SidebarResponsive from "./SidebarResponsive.svelte";
  let showSidebar = $state(false);
  let showProfiles = $state(false);
  $effect(() => {
    showProfiles = page.url.pathname === "/" || !!page.params.c;
  });
  const api = new UserApi();
  const debounce = new Debounce();
  const debounce2 = new Debounce();
  let open = $state(false);
  const bounce1 = debounce.bounce(() => {
    showSidebar = true;
  }, 300);
  const bounce2 = debounce2.bounce(() => {
    showSidebar = false;
  }, 300);
  const openNav = () => {
    debounce2.clear();
    bounce1();
  };

  const closeNav = () => {
    debounce.clear();
    bounce2();
  };

  /**
   * 
    const size = {
    open: "16rem",
    closed: "4rem",
    rOpen: "13rem",
    rClose: "3rem",
  };
   */

  const size = {
    open: "16rem",
    closed: "4rem",
    rOpen: "13rem",
    rClose: "3rem",
  };
</script>

{#if $siteUser}
  <PersonalProfile bind:open />
{/if}

<SidebarResponsive />

<div
  class="transition-all duration-300 ease-in-out overflow-hidden border-r-2 border-gray-100 dark:border-gray-700 hidden md:block"
  style="width: {showSidebar ? size.open : size.closed}"
  role="button"
  tabindex="0"
  onmouseenter={openNav}
  onfocus={() => {
    debounce2.clear();
    debounce.clear();
  }}
  onmouseleave={closeNav}
>
  <Sidebar
    id="sidebar"
    class={"flex transform transition hover:-translate-x-1 motion-reduce:transition-none w-full h-[100dvh] bg-transparent dark:bg-transparent"}
    activeUrl={page.url.pathname}
    backdrop={false}
    position="static"
    classes={{ div: "bg-transparent dark:bg-transparent" }}
  >
    <div
      class="relative h-[100dvh]"
      transition:slide={{ duration: 200, easing: cubicInOut }}
    >
      <SidebarWrapper id="sidebar-wrapper">
        <div class="flex mb-4 gap-2">
          <NavBrand href="/">
            <NavBranding hideText={!showSidebar} />
          </NavBrand>
        </div>
        <SidebarItems open={showSidebar}></SidebarItems>
      </SidebarWrapper>
      <div
        style="width: {showSidebar ? size.rOpen : size.rClose}"
        class="absolute bottom-6"
        id="sidebar-content"
      >
        <div class=" justify-center flex w-full flex-col">
          <div class="w-full">
            {#if $siteUser}
              <div class="flex-col space-x-2 w-full">
                <div class="flex space-x-2 justify-center w-full">
                  <div class="self-center">
                    {#if $siteUser.avatar}
                      <UserAvatar avatar={$siteUser.avatar} size="sm" />
                    {:else}
                      <UserOutline size="sm" />
                    {/if}
                  </div>
                  {#if showSidebar}
                    <A onclick={() => (open = true)}><P>{$siteUser.name}</P></A>
                  {/if}
                </div>
                <div class=" flex w-full">
                  <div class="self-center ml-auto mr-auto mt-2">
                    <DarkMode
                      id="dark-mode"
                      class=" {showSidebar ? '' : 'hidden'}"
                    />
                    {#if showSidebar}
                      <Popover
                        triggeredBy="#dark-mode"
                        trigger="hover"
                        placement="top">{$_t("Toggle Theme")}</Popover
                      >

                      <Popover
                        triggeredBy="#logout"
                        trigger="hover"
                        placement="top">{$_t("Logout")}</Popover
                      >
                      <Button
                        id="logout"
                        onclick={async () => {
                          await api.logout();
                          // goto("/", { replaceState: true });
                          location.reload();
                        }}
                        color="alternative"
                        class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 border-0"
                        ><ArrowRightToBracketOutline />
                      </Button>
                    {/if}
                  </div>
                </div>
              </div>
            {:else}
              <div class="flex-col space-x-2 w-full">
                <div class="flex space-x-2 content-center align-middle">
                  <div class="flex space-x-2 justify-center w-full">
                    <A class={showSidebar ? "" : ""} href="/signin"
                      ><ArrowLeftToBracketOutline />
                      {#if showSidebar}
                        <Heading tag="h6">{$_t("Signin")}</Heading>
                      {/if}</A
                    >
                  </div>
                </div>
                <div class="flex space-x-2 content-center align-middle mt-2">
                  <DarkMode
                    class="ml-auto mr-auto  {showSidebar ? '' : 'hidden'}"
                  />
                </div>
              </div>
            {/if}
          </div>
          <div class="text-center mt-2">
            {#if showSidebar}
              <BuiltWithLove />
            {:else}
              <p style="font-size: 0.5em  "></p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</div>
