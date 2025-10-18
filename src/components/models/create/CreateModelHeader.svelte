<script lang="ts">
  import { _t, type CrumbHeading } from "$lib";
  import { page } from "$app/stores";
  import { BreadCrumbs } from "$components";
  import {
    Navbar,
    Button,
    NavBrand,
    NavHamburger,
    NavLi,
    NavUl,
  } from "flowbite-svelte";

  export let headings: CrumbHeading[] = [];
  export let onCreate;
  export let verb = "Create";
  export let hideOnEdit = false;
  export let buttonColor:
    | "none"
    | "red"
    | "yellow"
    | "green"
    | "purple"
    | "blue"
    | "light"
    | "dark"
    | "primary"
    | "alternative"
    | undefined = undefined;
</script>

<Navbar>
  <NavBrand href={$page.url.pathname}>
    <BreadCrumbs {headings} />
  </NavBrand>
  <NavHamburger />
  <NavUl>
    <NavLi>
      {#if !hideOnEdit}
        <Button type="button" color={buttonColor} onclick={onCreate}
          >{$_t(verb)}</Button
        >
      {/if}
    </NavLi>
  </NavUl>
</Navbar>
