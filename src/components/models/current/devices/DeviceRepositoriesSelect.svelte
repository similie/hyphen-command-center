<script lang="ts">
  import { SourceRepository, type UUID } from "$lib";
  import { Select } from "flowbite-svelte";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    required,
    disabled,
    onchange,
  } = $props<{
    value?: UUID;
    required?: boolean;
    disabled?: boolean;
    onchange?: (value: UUID) => void;
  }>();
  let items = $state<{ value: UUID; name: string }[]>([]);
  const api = new SourceRepository();
  const pullRepositories = async () => {
    try {
      const repositories = await api.find().sort({ name: "ASC" }).fetch();
      items = repositories.map((repo) => ({
        value: repo.id as UUID,
        name: repo.name,
      }));
    } catch (e) {
      console.error("Error fetching repositories:", e);
    }
  };
  onMount(pullRepositories);
</script>

<Select
  {items}
  bind:value
  {required}
  {disabled}
  onchange={(e) => onchange?.(value)}
/>
