<script lang="ts">
  import { ForwardMapModel, type IForwardMap, type UUID } from "$lib";
  import { onMount } from "svelte";
  import { MultiSelect } from "flowbite-svelte";
  let {
    value = $bindable(),
    id,
    required = false,
    onChange,
    disabled = false,
    size = "md",
  } = $props<{
    value?: UUID[];
    id?: string;
    required?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    onChange?: (vals: UUID[]) => void;
  }>();
  let mappers = $state<IForwardMap[]>([]);
  let items = $state<{ value: UUID; name: string }[]>([]);
  let loading = $state(false);
  const api = new ForwardMapModel();
  const pullMappers = async () => {
    try {
      loading = true;
      mappers = await api.find().sort({ name: "ASC" }).fetch();
      items = mappers.map((d) => ({ value: d.id as UUID, name: d.name }));
    } catch (e) {
      console.error("Error pulling mappers", e);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    value = value || [];
    pullMappers();
  });
</script>

<MultiSelect
  bind:value
  {items}
  {size}
  {required}
  disabled={disabled || loading}
  classes={{ span: "space-y-1 " }}
  {id}
  onchange={() => onChange && onChange(value)}
/>
