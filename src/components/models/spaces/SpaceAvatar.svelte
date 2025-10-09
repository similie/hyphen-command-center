<script lang="ts">
  import { appFileBase, type SpacesModel } from "$lib";
  import { Avatar } from "flowbite-svelte";
  import PriceInput from "./PriceInput.svelte";
  let { plan, includePrice } = $props<{
    plan: SpacesModel;
    includePrice?: boolean;
  }>();
</script>

<div class="flex items-center space-x-2">
  {#if plan.image}
    <div>
      <Avatar src={appFileBase(plan.image, { size: "sm" })}></Avatar>
    </div>
  {/if}
  <div>
    {plan.name}
  </div>
  {#if includePrice}
    <div class="text-sm text-gray-500">(<PriceInput price={plan.price} />)</div>
  {/if}
</div>
