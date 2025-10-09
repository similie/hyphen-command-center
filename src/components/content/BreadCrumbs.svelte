<script lang="ts">
  import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
  import { _t, type CrumbHeading } from "$lib";

  let { headings } = $props<{
    headings: CrumbHeading[];
  }>();
</script>

<Breadcrumb aria-label="Default breadcrumb example">
  <BreadcrumbItem href="/" home>{$_t("Home")}</BreadcrumbItem>
  {#each headings as { title, href, icon }}
    <BreadcrumbItem {href}>
      {#if icon}
        <i class={icon}></i>
      {/if}

      <div class="text-nowrap">{$_t(title)}</div>
    </BreadcrumbItem>
  {/each}
</Breadcrumb>
