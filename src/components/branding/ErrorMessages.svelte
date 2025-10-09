<script lang="ts">
  import { Button, Card, Heading, P } from "flowbite-svelte";
  import { _t } from "$lib";
  import { page } from "$app/state";

  let { code, titleMessage, errorMessage } = $props<{
    code: number;
    errorMessage: string;
    titleMessage: string;
    image?: string;
  }>();

  let message = $derived(page.url.searchParams.get("message"));
</script>

<Card>
  <Heading tag="h5">{code} {titleMessage}</Heading>
  <P>{$_t(errorMessage)}</P>
  {#if message}
    <P color="danger" italic={true} size="sm">{message}</P>
  {/if}
  <Button tag="a" href="/" class="mt-2">{$_t("Take me home")}</Button>
</Card>
