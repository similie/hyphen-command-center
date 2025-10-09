<script lang="ts">
  import type { SpacesModel } from "$lib";
  import { page } from "$app/state";
  import PlanAvatar from "./SpaceAvatar.svelte";
  import { _ } from "svelte-i18n";
  import { Button, Dropdown, DropdownItem, P } from "flowbite-svelte";
  let {
    plan,
    edit = $bindable(false),
    onSelected,
  } = $props<{
    plan?: SpacesModel;
    edit: boolean;
    onSelected?: (plan: SpacesModel) => void;
  }>();
  let plans = $state<SpacesModel[]>(page.data.plans || []);
  const planChangeRequest = (selectedPlan: SpacesModel) => {
    onSelected && onSelected(selectedPlan);
  };
</script>

{#if !edit}
  {#if plan}
    <PlanAvatar {plan} includePrice />
  {:else}
    <P>{$_("Plan not selected")}</P>
  {/if}
{:else if edit && plans.length}
  <div class="d-flex flex-column"></div>
  <Button color="alternative">
    <!-- <PlanAvatar {plan} includePrice /> -->
    {#if plan}
      <PlanAvatar {plan} includePrice />
    {:else}
      {$_("Select a plan")}
    {/if}
  </Button>
  <Dropdown>
    {#each plans as selectPlan}
      {#if !plan || selectPlan.uid !== plan.uid}
        <DropdownItem onclick={() => planChangeRequest(selectPlan)}>
          <PlanAvatar plan={selectPlan} includePrice />
        </DropdownItem>
      {/if}
    {/each}
  </Dropdown>
{/if}
