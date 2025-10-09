<script lang="ts">
  import { ToastModels, ToastType, type IToast } from "$lib";
  import { ErrorToast, SuccessToast } from "./";
  let toastValues: IToast[] = [];
  ToastModels.subscribe((toasts) => {
    toastValues = toasts;
  });

  const findIndex = (searchToast: IToast) => {
    return toastValues.findIndex((toast) => toast.id === searchToast.id);
  };

  const onDestroy = (toast: IToast) => {
    const index = findIndex(toast);
    ToastModels.update((toasts) => {
      toasts.splice(index, 1);
      return toasts;
    });
  };
</script>

<div
  class="absolute top-2 right-12 w-72 text-wrap overflow-x-hidden"
  style="z-index:1000"
>
  {#each toastValues as toast (toast.id)}
    {#if toast.type === ToastType.Error}
      <ErrorToast {onDestroy} {toast} />
    {/if}
    {#if toast.type === ToastType.Success}
      <SuccessToast {onDestroy} {toast} />
    {/if}
  {/each}
</div>
