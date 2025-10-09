<script lang="ts">
  import { siteConfig, _t, siteMoneyFormatConfig } from "$lib";
  import { Span } from "flowbite-svelte";

  let { price = 0 } = $props<{ price?: number }>();
</script>

{#if price === 0}
  <Span>{$_t("Free")}</Span>
{:else}
  <Span>{siteMoneyFormatConfig(price, $siteConfig)}</Span>
{/if}
