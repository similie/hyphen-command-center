<script lang="ts">
  import { Navbar, NavBrand, NavUl, Heading, Img } from "flowbite-svelte";
  import {
    _t,
    type CrumbHeading,
    siteUser,
    UserRoles,
    siteConfig,
    OpenMobileNavbar,
  } from "$lib";

  import type { Snippet } from "svelte";
  import BreadCrumbs from "$components/content/BreadCrumbs.svelte";
  import { page } from "$app/state";

  let {
    title,
    headings,
    navLi,
    createSection,
    src,
    darkSrc,
    alt,
    width = 50,
  } = $props<{
    title: string;
    headings?: CrumbHeading[];
    navLi?: Snippet;
    createSection: Snippet;
    src?: string;
    darkSrc?: string;
    alt?: string;
    width?: number;
  }>();
  let activeUrl = $derived(page.url.pathname);
</script>

<Navbar color="form">
  <div class="flex w-full flex-col">
    <div class="flex w-full">
      <NavBrand class="flex space-x-4 items-center">
        <div class="flex md:hidden w-8"></div>
        <div class="hidden md:flex">
          {#if $siteConfig?.logos.header || src}
            <Img
              class="mt-2 dark:hidden"
              {width}
              {alt}
              src={src ?? $siteConfig?.logos.header}
            />
          {/if}
          {#if $siteConfig?.logos.darkHeader || darkSrc}
            <Img
              class="mt-2 hidden  dark:block"
              {width}
              {alt}
              src={darkSrc ?? $siteConfig?.logos.darkHeader}
            />
          {/if}
        </div>
        <Heading class="text-center md:text-left" tag="h4">{$_t(title)}</Heading
        >
      </NavBrand>
      {#if navLi}
        <NavUl {activeUrl}>
          {@render navLi()}
        </NavUl>
      {/if}

      <div class="ml-auto flex space-x-4 items-center">
        {#if !$OpenMobileNavbar}
          {@render createSection()}
        {/if}
      </div>
    </div>
    <!-- <div class="flex md:order-2 items-center space-x-4"> -->
    {#if headings}
      <div class="mt-1 hidden md:block">
        <BreadCrumbs {headings} />
      </div>
    {/if}
    <!-- </div> -->
    {#if navLi}
      <NavUl {activeUrl} class="block md:hidden text-center">
        {@render navLi()}
      </NavUl>
    {/if}
  </div>
</Navbar>
