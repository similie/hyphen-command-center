<script lang="ts">
  import {
    _t,
    LinkPermission,
    siteUser,
    UserRoles,
    type SidebarLink,
    type UserModel,
  } from "$lib";
  import {
    SidebarGroup,
    SidebarDropdownWrapper,
    SidebarItem,
    SidebarDropdownItem,
  } from "flowbite-svelte";
  import { loadLinks } from "./sidebarLinks";
  import { page } from "$app/state";
  import type { Snippet } from "svelte";
  let sidebar = $state(loadLinks());
  let {
    open = $bindable(false),
    children,
    sm,
    style,
  } = $props<{
    open?: boolean;
    sm?: boolean;
    children?: Snippet;
    style?: string;
  }>();
  const getIsOpen = () => {
    const isOpen: Record<string, boolean> = {};
    sidebar.links.forEach((l: SidebarLink) => {
      isOpen[l.name as string] = false;
    });

    return isOpen;
  };
  const isOpen: Record<string, boolean> = $state(getIsOpen());
  let openReady = $state(open);
  let user = $state<UserModel | undefined>($siteUser);
  $effect(() => {
    if (!open) {
      return (openReady = open);
    }

    setTimeout(() => {
      openReady = open;
    }, 200);
  });

  let role = $derived(user?.role || UserRoles.BLOCKED);
  let showLinks = $state(true);

  const toggleLinks = () => {
    setTimeout(() => (showLinks = true), 300);
  };
  siteUser.subscribe((u) => {
    showLinks = false;
    user = u;
    toggleLinks();
  });
  $effect(() => {
    if (user?.role === role) {
      return;
    }
    role = user?.role || UserRoles.BLOCKED;
    sidebar = loadLinks();
  });

  const isAvailable = (link: SidebarLink) => {
    if (link.role === UserRoles.UNRESTRICTED) {
      return true;
    }

    const role = user?.role || UserRoles.UNRESTRICTED;

    switch (link.exact) {
      case LinkPermission.EQ:
        return link.role === role;
      case LinkPermission.LESS:
        return link.role >= role;
      case LinkPermission.DEFAULT:
      default:
        return link.role <= role;
    }
  };
</script>

<SidebarGroup {style} class={sm ? "-ml-4" : "space-y-2"}>
  {#each sidebar.links as link}
    {#if isAvailable(link) && showLinks}
      {#if link.type === "item"}
        <SidebarItem
          label={openReady ? $_t(link.label) : ""}
          href={link.href}
          activeClass={open
            ? undefined
            : "flex items-center group-has-[ul]:ms-6 p-2 w-10 text-base font-normal text-gray-900 bg-gray-200 dark:bg-gray-700 rounded-sm dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"}
          spanClass="ms-3"
        >
          {#snippet icon()}
            {#if link.icon && !sm}
              <div class={open ? "ml-4-" : ""}>
                <link.icon
                  class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-300 hover:text-primary-700 "
                />
              </div>
            {/if}
          {/snippet}
        </SidebarItem>
      {:else if link.type === "wrapper"}
        <SidebarDropdownWrapper
          bind:isOpen={isOpen[link.name]}
          label={openReady ? $_t(link.label) : ""}
        >
          {#snippet icon()}
            {#if link.icon && !sm}
              <div class={open ? "-ml-4-" : ""}>
                <link.icon
                  class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-300 hover:text-primary-700 "
                />
              </div>
            {/if}
          {/snippet}
          {#if open && link.links && showLinks}
            {#each link.links as sublink}
              {@const href = `${link.href}${sublink.href}`}
              {#if isAvailable(sublink)}
                <SidebarDropdownItem
                  label={$_t(sublink.label)}
                  {href}
                  spanClass="ms-1"
                  active={page.url.pathname === href}
                />
              {/if}
            {/each}
          {/if}
        </SidebarDropdownWrapper>
      {/if}
    {/if}
  {/each}
  {@render children?.()}
</SidebarGroup>
