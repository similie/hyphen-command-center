<script lang="ts">
  import { GradientButton, Button } from "flowbite-svelte";
  import { _t } from "$lib";

  let { pretty = $bindable() } = $props<{ pretty: boolean }>();
</script>

{#if pretty}
  <GradientButton
    type="button"
    onclick={() => (pretty = true)}
    outline
    color="cyanToBlue"
    pill>{$_t("Pretty")}</GradientButton
  >
  <Button
    type="button"
    onclick={() => (pretty = false)}
    outline
    color={"alternative"}
    pill>{$_t("Raw")}</Button
  >
{:else}
  <Button
    type="button"
    onclick={() => (pretty = true)}
    outline
    color={"alternative"}
    pill>{$_t("Pretty")}</Button
  >
  <GradientButton
    type="button"
    onclick={() => (pretty = false)}
    outline
    color="cyanToBlue"
    pill>{$_t("Raw")}</GradientButton
  >
{/if}
