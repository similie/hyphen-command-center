<script lang="ts">
  import { _t } from "$lib";
  import { PopoutInfo } from "$components";

  let { message, name } = $props<{
    message: string;
    name: string;
  }>();
</script>

<div class="w-full flex items-center mx-5">
  <h5
    id="drawer-label"
    class="inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400 w-full"
  >
    <PopoutInfo {message} />

    {$_t(name)}
  </h5>
</div>
