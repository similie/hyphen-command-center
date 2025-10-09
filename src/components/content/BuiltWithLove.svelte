<script lang="ts">
  import { HeartSolid } from "flowbite-svelte-icons";
  let { em = 0.4 } = $props<{ em?: number }>();
</script>

<p style="font-size: {em}em" class="animate-fadeIn-300">
  Built with <HeartSolid size="xs" class="inline mt-0" color="red" />
  in Timor-Leste
</p>
