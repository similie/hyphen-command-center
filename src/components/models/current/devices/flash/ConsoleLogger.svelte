<script lang="ts">
  // Receive logs from parent via prop
  let { logs = [] } = $props<{ logs: string[] }>();

  let container: HTMLElement | null = null;
  let autoScrollEnabled = $state(true);

  function onScroll() {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    autoScrollEnabled = scrollHeight - (scrollTop + clientHeight) < 50;
  }

  $effect(() => {
    logs; // dependency
    if (!container) return;

    if (autoScrollEnabled) {
      // Use tick() if you're using SvelteKit or need the DOM update delay
      Promise.resolve().then(() => {
        container!.scroll({
          top: container!.scrollHeight,
          // behavior: "smooth",
        });
      });
    }
  });
</script>

<div
  bind:this={container}
  class="h-96 overflow-y-auto rounded-2xl dark:bg-gray-950 shadow p-2"
  onscroll={onScroll}
>
  <code class=" dark:text-gray-100">
    {@html logs
      .join("<br />")
      .replaceAll("\n", "<br />")
      .replace("\r", "<br />")}</code
  >
</div>
