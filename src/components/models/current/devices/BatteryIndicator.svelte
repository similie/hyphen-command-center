<script lang="ts">
  import { Progressbar } from "flowbite-svelte";

  let {
    level = 0,
    width = 24,
    color = "primary",
  } = $props<{
    level: number;
    width?: number;
    size?: string;
    color?:
      | "primary"
      | "secondary"
      | "gray"
      | "red"
      | "orange"
      | "amber"
      | "yellow"
      | "lime"
      | "green"
      | "emerald"
      | "teal"
      | "cyan"
      | "sky"
      | "blue"
      | "indigo"
      | "violet"
      | "purple"
      | "fuchsia"
      | "pink"
      | "rose"
      | undefined;
  }>();

  let height = $state(width / 2);

  // Validate / clamp

  let normalized = $state(Math.min(Math.max(Math.round(level), 0), 100));
  let barColor = $state<
    | "primary"
    | "secondary"
    | "gray"
    | "red"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose"
    | undefined
  >(color);

  $effect(() => {
    normalized = Math.min(Math.max(Math.round(level), 0), 100);
    barColor =
      color ??
      (normalized > 75 ? "primary" : normalized > 40 ? "yellow" : "fuchsia");
  });
</script>

<div class={`relative inline-block overflow-hidden  w-${width} h-${height}`}>
  <!-- Battery SVG Outline -->

  <svg
    class="absolute inset-0 w-full h-full"
    viewBox="0 0 24 12"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="0.1"
  >
    <rect x="1" y="1" width="20" height="10" rx="2" ry="2" />
    <rect x="21" y="3" width="2" height="6" rx="1" ry="1" />
  </svg>
  <div
    class="absolute top-[2px] left-[2px] right-1 bottom-[2px] overflow-hidden flex items-center"
  >
    <Progressbar
      progress={normalized}
      color={barColor}
      size="h-{height + 2}"
      classes={{
        label:
          "text-xs  text-hidden w-full h-full rounded-none  rounded-tl-md rounded-bl-md",
      }}
      class="rounded-none bg-transparent dark:bg-transparent "
      animate
      tweenDuration={500}
    />
  </div>
  <div
    class="absolute top-0 left-0 inset-0 flex pointer-events-none text-xs font-bold text-white drop-shadow"
  >
    &nbsp;{normalized}{#if normalized < 100}%{/if}
  </div>
</div>
