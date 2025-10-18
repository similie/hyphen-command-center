<script lang="ts">
  import { appFileBase, type UUID } from "$lib";
  import { Avatar } from "flowbite-svelte";
  import { UserSolid } from "flowbite-svelte-icons";
  export let avatar: string | UUID | undefined = undefined;
  export let size: "xs" | "sm" | "md" | "lg" = "lg";
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
    {size}><UserSolid class="w-8 h-8" /></Avatar
  >
{/if}
