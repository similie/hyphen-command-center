<script lang="ts">
  import { siteConfig } from "$lib";
  import { _t } from "$lib/i18n";
  import { P } from "flowbite-svelte";

  let { class: className = "", name = `${$siteConfig.siteName}` } = $props<{
    class?: string;
    name?: string;
  }>();
</script>

{#if $siteConfig.location}
  <div class="flex flex-col w-full space-y-4 {className}">
    <div class="flex-col">
      <P class="text-primary-600">{name} {$_t("Location")}:</P>

      <P>{$siteConfig.location}</P>
    </div>
    {#if $siteConfig.coordinates && $siteConfig.coordinates.lat && $siteConfig.coordinates.lng && $siteConfig.googleMapsKey}
      <div class="flex-1">
        <iframe
          title="Google Maps"
          class="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-md border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${$siteConfig.googleMapsKey}&q=${$siteConfig.coordinates.lat},${$siteConfig.coordinates.lng}&zoom=15`}
        ></iframe>
      </div>
    {/if}
  </div>
{/if}
