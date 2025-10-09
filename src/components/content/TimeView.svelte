<script lang="ts">
  import { Span } from "flowbite-svelte";

  let { value } = $props<{ value: string }>();
</script>

<Span>{value}</Span>
