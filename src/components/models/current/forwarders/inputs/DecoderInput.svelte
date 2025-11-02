<script lang="ts">
  import { DecoderModel, type IDecoder, type UUID } from "$lib";
  import { onMount } from "svelte";
  import { MultiSelect, type SelectOptionType } from "flowbite-svelte";

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

  let items = $state<SelectOptionType<UUID>[]>([]);
  let loading = $state(false);
  const api = new DecoderModel();
  const pullDecoders = async () => {
    try {
      loading = true;
      decoders = await api.find().sort({ name: "ASC" }).fetch();
      if (value) {
        const setMap: Record<UUID, boolean> = {};
        for (const val of value) {
          const decoder = decoders.find((d) => d.id === val);
          if (!decoder) {
            continue;
          }
          items.push({ value: decoder.id as UUID, name: decoder.name });
          setMap[decoder.id as UUID] = true;
        }

        for (const dec of decoders) {
          if (!setMap[dec.id as UUID]) {
            items.push({ value: dec.id as UUID, name: dec.name });
          }
        }
      } else {
        items = decoders.map((d) => ({ value: d.id as UUID, name: d.name }));
      }
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
  classes={{ span: "space-y-1 " }}
  disabled={disabled || loading}
  {id}
  onchange={() => onChange && onChange(value)}
/>
