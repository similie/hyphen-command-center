<script lang="ts">
  import { siteConfig } from "$lib";
  import { A } from "flowbite-svelte";
  let {
    size = "lg",
    hideText = $bindable(false),
    hideImage = $bindable(false),
  } = $props<{ size?: string; hideText?: boolean; hideImage?: boolean }>();
  let src = $state("");
  let srcDark = $state("");
  let siteName = $state("");

  siteConfig.subscribe((config) => {
    src = config.logos.nav;
    srcDark = config.logos.darkNav || config.logos.nav;
    siteName = config.siteName;
  });
</script>

{#if !hideImage}
  <A href="/" class="sm:w-9">
    <img
      {src}
      class={size === "lg" ? "mr-3 h-6 sm:h-9 sm:w-9 dark:hidden " : size}
      alt={$siteConfig.siteName || "Similie"}
    />

    <img
      src={srcDark}
      class={size === "lg" ? "mr-3 h-6 sm:h-9 sm:w-9 dark:block hidden " : size}
      alt={$siteConfig.siteName || "Similie"}
    />
  </A>
{/if}
{#if !hideText}
  <div
    class="self-center whitespace-nowrap text-xl font-semibold dark:text-white ml-2 mt-1 animate-fadeIn-300"
  >
    {siteName}
  </div>
{/if}
