<script lang="ts">
  import { MacbookScroll } from ".";
  import { Motion } from "svelte-motion";
  import { Button } from "flowbite-svelte";
</script>

<div class="w-full overflow-hidden">
  <Motion>
    <MacbookScroll src={`/temp.png`} showGradient={false}>
      <div slot="title" class="max-w-4xl mx-auto">
        We interpolate data at the surface and way up in the sky to breathe life
        into your weather maps. Past, present, and future
      </div>

      <a slot="badge" href="https://similie.org">
        <!-- <SimilieLogo height="18" width="18" overrideColor="#ef562f,#ef562f" /> -->
      </a>
    </MacbookScroll>
  </Motion>
</div>
