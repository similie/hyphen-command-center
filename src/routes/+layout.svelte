<script lang="ts">
  import { loadI18n, siteConfig } from "$lib";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import "../app.css";
  let { children } = $props();
  let ready = $state(false);
  const setGtag = () => {
    if (browser && import.meta.env.MODE === "production") {
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = "https://www.googletagmanager.com/gtag/js?id=G-D37PHNCQKR";
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-D37PHNCQKR');
    `;
      document.head.appendChild(script2);
    }
  };

  onMount(async () => {
    await loadI18n();
    setGtag();
    const url = new URL(window.location.href);
    // Look for the force-reload param
    const reloadTo = url.searchParams.get("force-reload"); //  [oai_citation:0‡MDN Web Docs](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/Svelte_stores?utm_source=chatgpt.com)
    if (reloadTo) {
      // Perform a hard redirect to the target, replacing current history entry
      return window.location.replace(reloadTo); //  [oai_citation:1‡DEV Community](https://dev.to/brendanmatkin/safe-sveltekit-stores-for-ssr-5a0h?utm_source=chatgpt.com)
    }
    ready = true;
  });

  $effect(() => {
    const data = page.data;
    if (data?.config && (!$siteConfig || $siteConfig.id === -1)) {
      siteConfig.set(data.config);
    }
  });
</script>

<svelte:head>
  <title>{$siteConfig?.siteName || "Similie"}</title>
  <meta
    name="description"
    content={$siteConfig?.siteDescription || "Similie - API Key Management"}
  />
</svelte:head>

{#if ready}
  {@render children()}
{/if}
