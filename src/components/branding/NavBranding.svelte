<script lang="ts">
  import { siteConfig } from "$lib";
  import { A, Img } from "flowbite-svelte";
  let {
    size = "lg",
    hideText = $bindable(false),
    hideImage = $bindable(false),
  } = $props<{ size?: string; hideText?: boolean; hideImage?: boolean }>();
  let src = $state("");
  let srcDark = $state("");
  let siteName = $state("");
  let width = $derived(size === "lg" ? 36 : size === "sm" ? 24 : 48);
  siteConfig.subscribe((config) => {
    src = config.logos.nav;
    srcDark = config.logos.darkNav || config.logos.darkNav;
    siteName = config.siteName;
  });
</script>

{#if !hideImage}
  <A href="/" class="sm:w-9">
    {#if $siteConfig?.logos.nav || src}
      <Img
        class="mt-2 dark:hidden"
        {width}
        alt={siteName}
        src={src ?? $siteConfig?.logos.nav}
      />
    {/if}
    {#if $siteConfig?.logos.darkNav || srcDark}
      <Img
        class="mt-2 hidden  dark:block"
        {width}
        alt={siteName}
        src={srcDark ?? $siteConfig?.logos.darkNav}
      />
    {/if}
  </A>
{/if}
{#if !hideText}
  <div
    class="self-center whitespace-nowrap text-xl font-semibold dark:text-white ml-2 mt-1 animate-fadeIn-300"
  >
    {siteName}
  </div>
{/if}
