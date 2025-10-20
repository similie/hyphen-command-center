<script lang="ts">
  import { appFileBase, type IForwarderTemplate, _t } from "$lib";
  import { Card, GradientButton, Heading, Hr, P } from "flowbite-svelte";
  import { CheckOutline, PlusOutline } from "flowbite-svelte-icons";

  let { value, onSelect, active } = $props<{
    value: IForwarderTemplate;
    onSelect: (template: IForwarderTemplate) => void;
    active?: boolean;
  }>();
</script>

<Card
  img={value.avatar ? appFileBase(value.avatar, "md") : undefined}
  imgClass="h-48 w-full object-contain "
>
  <div class="flex flex-col space-y-4 w-full p-4 flex-1">
    <Heading
      tag="h5"
      class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    >
      {value.name}
    </Heading>
    <P class="mb-3 flex-grow">
      {value.description}
    </P>
    <div class="flex flex-col w-full mt-auto-">
      <Hr class="my-4" />
      <GradientButton
        disabled={active}
        onclick={() => onSelect(value)}
        outline
        color={active ? "purpleToPink" : "cyanToBlue"}
      >
        {#if !active}
          <PlusOutline />
        {:else}
          <CheckOutline />
        {/if}&nbsp;
        {$_t("Use Template")}
      </GradientButton>
    </div>
  </div>
</Card>
