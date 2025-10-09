<script lang="ts">
  let { content } = $props<{
    content: { content: string; color?: string; a?: string }[];
  }>();
  import { _t } from "$lib";
  import { A } from "flowbite-svelte";
</script>

<h3 class="text-xl font-medium text-gray-900 dark:text-white">
  {#each content as item}
    {#if item.color}
      <span class="text-{item.color}-700 dark:text-{item.color}-500">
        {#if item.a}
          <A href={item.a}>{$_t(item.content)}</A>
        {:else}
          {$_t(item.content)}
        {/if}
      </span>
    {:else}
      <span>{$_t(item.content)}</span>
    {/if}
  {/each}
</h3>
