<script lang="ts">
  import { Sidebar } from "$components";
  import { ScrollTopValue } from "$lib";
  import { onMount, type Snippet } from "svelte";
  import { afterNavigate } from "$app/navigation";
  let { children } = $props<{ children: Snippet }>();
  onMount(() => {
    const container = document.getElementById("main-body-content");
    if (!container) {
      console.error("Container element not found");
      return;
    }
    container.addEventListener("scroll", () => {
      ScrollTopValue.set({
        top: container.scrollTop,
        height: container.scrollHeight,
      });
    });
  });

  afterNavigate(() => {
    setTimeout(
      () => document.getElementById("main-body-content")?.scrollTo({ top: 0 }),
      1,
    );
  });
</script>

<div class=" min-h-screen flex flex-row">
  <Sidebar />

  <main
    id="main-body-content"
    class="h-screen max-h-[100dvh] w-full flex flex-col overflow-y-auto"
  >
    {@render children()}
  </main>
</div>
