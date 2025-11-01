<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { slide } from "svelte/transition";
  import { CloseCircleSolid } from "flowbite-svelte-icons";
  import { _t, type IToast } from "$lib";
  let { toast, onDestroy } = $props<{
    toast: IToast;
    onDestroy: (toast: IToast) => void;
  }>();

  if (toast.duration || toast.duration === null) {
    setTimeout(() => onDestroy(toast), toast.duration || 5000);
  }
</script>

<Toast
  color="rose"
  transition={slide}
  class="mt-5"
  onclose={() => onDestroy(toast)}
>
  {#snippet icon()}
    <CloseCircleSolid class="w-5 h-5" />
    <span class="sr-only">Error icon</span>
  {/snippet}
  {$_t(toast.message)}
</Toast>
