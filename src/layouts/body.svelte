<script lang="ts">
  import { UserProfile } from "$components";
  import { Footer } from "flowbite-svelte";
</script>

<!-- <div class="flex mt-10 w-full flex-grow"> -->
<!-- <div class=" relative bg-black"> -->
<div class="absolute top-6 right-8">
  <UserProfile />
</div>
<!-- </div> -->
<div class="flex w-full p-6 flex-grow">
  <div class="grow max-w-4xl mx-auto">
    <slot />
  </div>
</div>

<Footer class="sticky start-0 bottom-0">
  <slot name="footer"></slot>
</Footer>
