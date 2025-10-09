<script lang="ts">
  import { Spinner } from "flowbite-svelte";
  import { _t } from "$lib";
</script>

<div class="h-full flex items-center justify-center">
  <div class="place-self-center">
    {$_t("Please wait")}... <Spinner class="me-3" size="4" />
  </div>
</div>
