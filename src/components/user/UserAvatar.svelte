<script lang="ts">
  import { appFileBase, type UUID } from "$lib";
  import { Avatar } from "flowbite-svelte";
  import { BatteryOutline, UserSolid } from "flowbite-svelte-icons";
  export let avatar: string | UUID | undefined = undefined;
  export let size: "xs" | "sm" | "md" | "lg" = "lg";
  export let type: "user" | "device" = "user";
  export let rounded: boolean = false;
  export let border: boolean = false;
  export let aClass: string | undefined = undefined;
</script>

{#if avatar}
  <Avatar
    class={aClass}
    {border}
    cornerStyle={rounded ? "rounded" : "circular"}
    {size}
    src={appFileBase(avatar, { size: "md" })}
  />
{:else}
  <Avatar
    class={aClass}
    {border}
    cornerStyle={rounded ? "rounded" : "circular"}
    {size}
  >
    {#if type === "device"}
      <BatteryOutline class="w-7 h-7" />
    {:else}
      <UserSolid class="w-8 h-8" />
    {/if}
  </Avatar>
{/if}
