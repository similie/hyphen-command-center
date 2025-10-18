<script lang="ts">
  import { page } from "$app/state";
  import { HeaderContentWrapper } from "$layouts";
  import DecodeEditor from "./DecodeEditor.svelte";
  import ForwarderTemplatesEditor from "./ForwarderTemplatesEditor.svelte";
  import ForwardMapEditor from "./ForwardMapEditor.svelte";
  import ForwarderEditor from "./ForwarderEditor.svelte";

  let activeUrl = $derived(page.url.pathname);
</script>

<HeaderContentWrapper>
  {#if activeUrl.includes("forwarders/decoders")}
    <DecodeEditor />
  {:else if activeUrl.includes("forwarders/forwardmaps")}
    <ForwardMapEditor />
  {:else if activeUrl.includes("forwarders/templates")}
    <ForwarderTemplatesEditor />
  {:else}
    <ForwarderEditor />
  {/if}
</HeaderContentWrapper>
