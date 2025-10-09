<script lang="ts">
  import { SimilieLogo } from "$components/branding";
  import { GlobeOutline } from "flowbite-svelte-icons";
</script>

<div class="relative w-6 h-6">
  <div
    class="w-3 absolute top-0 right-0 z-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
  >
    <SimilieLogo width={"100%"} overrideColor={"#f3f4f6,#6a7282"} />
  </div>
  <GlobeOutline class="text-gray-500 dark:text-gray-200" />
</div>
