<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { slide } from "svelte/transition";
  import { CloseCircleSolid } from "flowbite-svelte-icons";
  import { _t, type IToast } from "$lib";
  export let toast: IToast;
  export let onDestroy: (toast: IToast) => void;

  if (toast.duration || toast.duration === null) {
    setTimeout(() => onDestroy(toast), toast.duration || 5000);
  }
</script>

<Toast
  color="red"
  transition={slide}
  class="mt-5"
  on:close={() => onDestroy(toast)}
>
  <svelte:fragment slot="icon">
    <CloseCircleSolid class="w-5 h-5" />
    <span class="sr-only">Error icon</span>
  </svelte:fragment>
  {$_t(toast.message)}
</Toast>
