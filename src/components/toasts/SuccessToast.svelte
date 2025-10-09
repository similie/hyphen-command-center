<script lang="ts">
    import { Toast, P } from "flowbite-svelte";
    import { slide } from "svelte/transition";
    import { ThumbsUpOutline } from "flowbite-svelte-icons";
    import { _t, type IToast } from "$lib";
    export let toast: IToast;
    export let onDestroy: (toast: IToast) => void;

    if (toast.duration || toast.duration === null) {
        setTimeout(() => onDestroy(toast), toast.duration || 5000);
    }
</script>

<Toast
    color="green"
    transition={slide}
    class="mt-5 w-full"
    on:close={() => onDestroy(toast)}
>
    <svelte:fragment slot="icon">
        <ThumbsUpOutline class="w-5 h-5" />
        <span class="sr-only">Success icon</span>
    </svelte:fragment>
    <P>{$_t(toast.message)}</P>
</Toast>
