<script lang="ts">
  import { DecoderModel, type IDecoder, type UUID } from "$lib";
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
  let decoders = $state<IDecoder[]>([]);
  let items = $state<{ value: UUID; name: string }[]>([]);
  let loading = $state(false);
  const api = new DecoderModel();
  const pullDecoders = async () => {
    try {
      loading = true;
      decoders = await api.find().sort({ name: "ASC" }).fetch();
      items = decoders.map((d) => ({ value: d.id as UUID, name: d.name }));
    } catch (e) {
      console.error("Error pulling decoders", e);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    value = value || [];
    pullDecoders();
  });
</script>

<MultiSelect
  bind:value
  {items}
  {size}
  {required}
  disabled={disabled || loading}
  {id}
  onchange={() => onChange && onChange(value)}
/>
