<script lang="ts">
  import { DeviceModel, _t, type IDevice } from "$lib";
  let { device, text } = $props<{ device: IDevice; text?: boolean }>();

  DeviceModel.isOnline(device.lastTouched);
  let isOnline = $derived(DeviceModel.isOnline(device.lastTouched));
</script>

{#if text}
  {#if !device.lastTouched}
    <span class="text-gray-500 font-bold">{$_t("Never Connected")}</span>
  {:else if isOnline}
    <span class="text-primary-600 font-bold">{$_t("Online")}</span>
  {:else}
    <span class="font-bold">{$_t("Offline")}</span>
  {/if}
{:else}
  <!-- Primary flashing dot -->
  <div class="relative inline-flex h-3 w-3">
    <span
      class={`absolute inset-0 rounded-full ${isOnline ? "animate-breathe-dot bg-gray-400" : "bg-gray-400"}`}
    ></span>
    {#if isOnline}
      <span
        class="absolute inset-0 rounded-full bg-[var(--color-primary-600)] opacity-50 animate-ping [animation-duration:2s]"
      ></span>
    {/if}
  </div>
{/if}
