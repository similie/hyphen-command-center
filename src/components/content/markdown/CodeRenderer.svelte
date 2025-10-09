<script lang="ts">
  import github from "svelte-highlight/styles/github";
  // import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  // import atelierCave from "svelte-highlight/styles/nord";
  // import atelierCave from "svelte-highlight/styles/atelier";
  import androidstudio from "svelte-highlight/styles/androidstudio";
  import { HighlightAuto } from "svelte-highlight";
  import { isDarkMode, onDarkModeChange } from "$lib";
  import { writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  export let text: string;
  let darkMode = writable(isDarkMode());
  let dmFunction: (() => void) | undefined;
  onMount(async () => {
    dmFunction = await onDarkModeChange(() => {
      darkMode.set(isDarkMode() || false);
    });
  });

  onDestroy(() => {
    dmFunction && dmFunction();
  });
</script>

<svelte:head>
  {#if $darkMode}
    {@html androidstudio}
  {:else}
    {@html github}
  {/if}
</svelte:head>

<div class="">
  <HighlightAuto code={text} class="overflow-y-auto rounded-lg" />
</div>
