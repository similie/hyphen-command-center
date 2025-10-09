<script lang="ts">
  import { _t } from "$lib";
  import { P } from "flowbite-svelte";
</script>

<!-- <P class="text-center">
</P>
<span></span>{$_t("Or")}--- -->

<div class="flex items-center gap-4">
  <div class="flex-grow border-t border-primary-300"></div>
  <span class="text-gray-500 text-sm">{$_t("Or")}</span>
  <div class="flex-grow border-t border-primary-300"></div>
</div>
