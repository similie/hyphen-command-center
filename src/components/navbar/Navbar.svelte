<script lang="ts">
  import { Navbar, NavBrand, NavUl, Heading, Img } from "flowbite-svelte";
  import { _t, type CrumbHeading, siteUser, UserRoles, siteConfig } from "$lib";

  import type { Snippet } from "svelte";
  import BreadCrumbs from "$components/content/BreadCrumbs.svelte";

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
</script>

<Navbar color="form">
  <div class="flex w-full flex-col">
    <div class="flex w-full">
      <NavBrand class="flex  space-x-4 items-center ">
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
        <Heading tag="h4">{$_t(title)}</Heading>
      </NavBrand>

      <NavUl>
        {#if navLi}
          {@render navLi()}
        {/if}
      </NavUl>

      <div class="ml-auto flex space-x-4 items-center">
        {#if !$siteUser || $siteUser.role <= UserRoles.USER}
          <!-- <CartIcon class="mt-3" /> -->
        {/if}
        {@render createSection()}
      </div>
    </div>
    <!-- <div class="flex md:order-2 items-center space-x-4"> -->
    {#if headings}
      <div class="mt-1 hidden md:block">
        <BreadCrumbs {headings} />
      </div>
    {/if}
    <!-- </div> -->
  </div>
</Navbar>
