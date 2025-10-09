<script lang="ts">
  import { type UUID, ProductsModels } from "$lib";
  import { ProductsApi } from "$lib/api/models/products";
  import { Select } from "flowbite-svelte";
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    disabled,
    required,
    onchange,
    id,
    multiple = false,
    oninput,
  } = $props<{
    value: UUID | UUID[];
    multiple?: boolean;
    disabled?: boolean;
    id?: string;
    required?: boolean;
    onchange?: (value: UUID | UUID[]) => void;
    oninput?: (value: UUID | UUID[]) => void;
  }>();

  const onChangeLocal = () => {
    onchange?.(value);
    oninput?.(value);
  };

  let items = $state<{ value: string; name: string }[]>(
    $ProductsModels.map((p) => ({ value: p.uid, name: p.name })),
  );

  const api = new ProductsApi();
  const pullProducts = async () => {
    if (items.length) {
      return;
    }
    try {
      const { products } = await api.all();
      ProductsModels.set(products);
      items = products.map((p) => ({ value: p.uid, name: p.name }));
    } catch (e) {
      console.error("Failed to load products", e);
    }
  };
  onMount(pullProducts);
</script>

<Select
  {disabled}
  {id}
  {required}
  {multiple}
  {items}
  bind:value
  onchange={onChangeLocal}
></Select>
