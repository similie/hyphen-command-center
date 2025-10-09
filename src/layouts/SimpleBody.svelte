<script>
  import CenteredContent from "./CenteredContent.svelte";
  import { Toasts } from "$components";
</script>

<Toasts />

<CenteredContent>
  <slot />
</CenteredContent>
