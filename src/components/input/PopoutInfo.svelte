<script lang="ts">
  import { A, Popover } from "flowbite-svelte";
  import { InfoCircleOutline } from "flowbite-svelte-icons";
  import { _t } from "$lib";

  let { message } = $props<{ message: string }>();
</script>

<A
  ><InfoCircleOutline />
  <Popover>{$_t(message)}</Popover></A
>
