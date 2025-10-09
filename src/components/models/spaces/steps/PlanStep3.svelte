<script lang="ts">
  import { type SpacesModel, _t } from "$lib";
  import { Heading, P, Hr } from "flowbite-svelte";
  import PlanCard from "../SpaceCard.svelte";
  import { onMount } from "svelte";

  let { model = $bindable(), disableNext = $bindable(false) } = $props<{
    model: Partial<SpacesModel>;
    // submit: () => void;
    disableNext: boolean;
  }>();
  disableNext = false;
  onMount(() => {
    console.log("PlanStep3", model);
    disableNext = false;
  });
</script>

<div class="text-center">
  <Heading tag="h3">{$_t("Ready to create this space?")}</Heading>
</div>
<P>{$_t("Hit Create to submit")}</P>
<Hr />
<PlanCard {model} />
