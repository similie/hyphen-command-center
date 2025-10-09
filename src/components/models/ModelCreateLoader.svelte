<script lang="ts">
  import { Heading, Spinner } from "flowbite-svelte";
  import { _t } from "$lib";
  export let caption: string;
</script>

<div class="text-center">
  <Heading class="my-16" tag="h5"
    >{$_t("Processing ")} {$_t(caption)}&nbsp;<Spinner size={6} /></Heading
  >
</div>
