<script lang="ts">
  import { _t, type ListViewProps } from "$lib";
  import { Label } from "flowbite-svelte";

  let { list } = $props<{ list: ListViewProps[] }>();
</script>

<ul>
  {#each list as item}
    <li class="flex space-x-2 content-center align-middle">
      <Label color={item.color}>{$_t(item.label)}</Label>
      <Label class="text-gray-200">{item.content}</Label>
    </li>
  {/each}
</ul>
