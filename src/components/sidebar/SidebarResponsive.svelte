<script lang="ts">
  import { page } from "$app/state";
  import { slide } from "svelte/transition";
  import { siteUser, _t, UserApi } from "$lib";
  import {
    Sidebar,
    Button,
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
    BarsOutline,
    UserOutline,
  } from "flowbite-svelte-icons";
  import SidebarItems from "./SidebarItems.svelte";
  import { NavBranding, PersonalProfile, UserAvatar } from "$components";
  import { cubicInOut } from "svelte/easing";
  import BuiltWithLove from "$components/content/BuiltWithLove.svelte";
  let showSidebar = $state(false);
  let showProfiles = $state(false);
  //   let isOpen = $state(false);
  $effect(() => {
    showProfiles = page.url.pathname === "/" || !!page.params.c;
  });
  const api = new UserApi();
  let open = $state(false);
</script>

{#if $siteUser}
  <PersonalProfile bind:open />
{/if}

<!-- Floating open button (mobile only) -->
<div class="relative">
  <div
    class="md:hidden fixed {showSidebar
      ? 'left-36 top-2 '
      : 'left-3 top-2 '} z-[60] flex items-center"
  >
    <Button
      color="alternative"
      class="rounded-full p-2 shadow-md"
      onclick={() => (showSidebar = !showSidebar)}
      aria-label="Open navigation"
    >
      <BarsOutline />
    </Button>
  </div>
</div>

<div
  class="transition-all duration-300 ease-in-out overflow-hidden md:hidden relative"
  style="width: {showSidebar ? '16rem' : '0'}"
>
  <Sidebar
    id="sidebar-responsive"
    disableBreakpoints={true}
    class={"flex transform transition hover:-translate-x-1 motion-reduce:transition-none w-full h-[100dvh] overflow-hidden"}
    activeUrl={page.url.pathname}
    backdrop={true}
    position="static"
    classes={{ div: "bg-transparent dark:bg-transparent" }}
  >
    <div
      class="relative w-full h-[calc(100dvh-2rem)]"
      style="width: {showSidebar ? '8rem' : '0'}"
      transition:slide={{ duration: 200, easing: cubicInOut }}
    >
      <SidebarWrapper id="sidebar-wrapper-responsive">
        <div class="flex mb-2">
          <NavBranding />
        </div>

        <SidebarItems sm open={showSidebar}></SidebarItems>
      </SidebarWrapper>
      <div class="absolute bottom-0" id="sidebar-content-responsive">
        <div class="flex w-full flex-col">
          <div class="w-full">
            {#if $siteUser}
              <div class="flex-col space-x-1 w-full">
                <div class="flex space-x-1 w-full">
                  <div>
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
                <div class="flex w-full">
                  <div class="ml-5">
                    <DarkMode
                      id="dark-mode"
                      class={showSidebar ? "" : "hidden"}
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
                        class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm  border-0"
                        ><ArrowRightToBracketOutline />
                      </Button>
                    {/if}
                  </div>
                </div>
              </div>
            {:else}
              <div class="flex-col w-full">
                <div class="flex w-full">
                  <div class="flex space-x-1 ml-auto mr-auto">
                    <A class={showSidebar ? "" : ""} href="/signin"
                      ><ArrowLeftToBracketOutline />
                      {#if showSidebar}
                        <Heading tag="h6">{$_t("Signin")}</Heading>
                      {/if}</A
                    >
                  </div>
                </div>
                <div class="flex w-full">
                  <DarkMode
                    class="ml-auto mr-auto  {showSidebar ? '' : 'hidden'}"
                  />
                </div>
              </div>
            {/if}
          </div>
          <div class="ml-auto mr-auto">
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
