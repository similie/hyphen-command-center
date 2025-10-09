<script lang="ts">
  import { page } from "$app/state";
  import { NavLi, NavUl } from "flowbite-svelte";
  import { _t } from "$lib";
  let activeUrl = $derived(page.url.pathname);
</script>

<NavUl {activeUrl}>
  <NavLi href="/admin/forms">{$_t("Forms")}</NavLi>
  <NavLi href="/admin/forms/applications">{$_t("Applications")}</NavLi>
</NavUl>
