<script lang="ts">
  import AvatarBuilder from "$components/input/AvatarBuilder.svelte";
  import { type SpacesModel, UserRoles, _t } from "$lib";
  import {
    Input,
    Label,
    Helper,
    ButtonGroup,
    Textarea,
    Toggle,
  } from "flowbite-svelte";

  import PlanCard from "../SpaceCard.svelte";
  import StyleWriter from "$components/input/StyleWriter.svelte";
  import { UserRoleSelect } from "$components/input";
  import SpaceTagsInput from "../SpaceTagsInput.svelte";
  let {
    model = $bindable(),
    disableNext = $bindable(false),
    formChange,
  } = $props<{
    model: Partial<SpacesModel>;
    disableNext: boolean;
    formChange?: () => void;
  }>();
  let formElement = $state<HTMLFormElement | null>(null);

  const checkValidity = () => {
    disableNext = !formElement?.checkValidity();
    formChange && formChange();
  };
</script>

<div class="flex space-x-4 justify-center items-start mb-6">
  <form bind:this={formElement} oninput={checkValidity} class="max-w-1/2">
    <div class="grid gap-6 mb-6 md:grid-cols-6">
      <div class="col-span-6">
        <Label for="plan_name" class="mb-2">{$_t("Plan Name")}</Label>
        <ButtonGroup class="w-full">
          <Input
            type="text"
            id="plan_name"
            placeholder="Your catchy name"
            required
            bind:value={model.name}
          />

          <AvatarBuilder
            size="md"
            bind:avatar={model.image}
            aspect={5 / 3}
            noShowAvatar={true}
            buttonColor="primary"
            onavatar={() => {}}
            role={UserRoles.UNRESTRICTED}
          />
        </ButtonGroup>
      </div>

      <div class="col-span-3">
        <Label for="plan_price" class="mb-2">{$_t("Monthly Plan Price")}</Label>
        <Input
          type="number"
          id="plan_price"
          placeholder="0"
          required
          step="0.01"
          bind:value={model.price}
        />
      </div>

      <div class="col-span-3">
        <Label for="btn_text" class="mb-2">{$_t("Button Text")}</Label>
        <Input
          type="text"
          id="plan_name"
          placeholder="Change the default button text"
          bind:value={model.btnText}
        />
      </div>

      <div class="col-span-6">
        <Label for="plan_teaser" class="mb-2">{$_t("Space Teaser")}</Label>
        <Textarea
          id="plan_teaser"
          placeholder="A short description to entice users to select this space"
          required
          bind:value={model.teaser}
          rows={4}
          class="w-full"
          maxlength={400}
        />

        <Helper>
          {$_t("You can use Markdown syntax to format your space description.")}
          <small
            >{$_t("Max 400 characters:")} {model.teaser?.length || 0}/400</small
          >
        </Helper>
      </div>

      <div class="col-span-6">
        <Label for="plan_description" class="mb-2"
          >{$_t("Space Description")}</Label
        >
        <StyleWriter
          id="plan_description"
          required
          bind:value={model.description}
        />

        <Helper>
          {$_t("You can add style to your space description content .")}
        </Helper>
      </div>

      <div class="col-span-2">
        <Label for="plan_order">{$_t("Space Weight")}</Label>
        <Input
          type="number"
          id="plan_order"
          placeholder="0"
          required
          min="0"
          bind:value={model.weight}
        />
      </div>
      <div class="col-span-2">
        <UserRoleSelect
          bind:model={model.role}
          defaultRole={UserRoles.UNRESTRICTED}
          text="Set User Role"
        />
      </div>
      <div class="col-span-2">
        <Label for="btn_text">{$_t("Set Active")}</Label>
        <div class="relative">
          <Toggle id="btn_text" size="large" bind:checked={model.active} />
        </div>
      </div>

      <div class="col-span-6">
        <Label for="space_tags">{$_t("Tag the Space")}</Label>
        <SpaceTagsInput id="space_tags" bind:value={model.tags} />
      </div>
    </div>
  </form>
  <PlanCard {model} />
</div>
