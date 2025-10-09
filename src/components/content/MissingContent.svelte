<script lang="ts">
  import { _t } from "$lib";
  export let text: string = $_t("Missing Content");
</script>

<div class="h-full flex items-center justify-center">
  <div class="place-self-center">
    {$_t(text)}
  </div>
</div>
