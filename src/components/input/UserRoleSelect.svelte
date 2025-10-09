<script lang="ts">
  import { page } from "$app/state";
  import { UserRoles, UserRolesStrings, _t } from "$lib";
  import { Select, Label } from "flowbite-svelte";
  import { onMount } from "svelte";
  const config = page.data.config;

  let {
    text = "Select a Role",
    noLabel = false,
    model = $bindable(),
    disabled = false,
    oninput,
    className = "",
    id,
    defaultRole = config.defaultRole,
  } = $props<{
    text?: string;
    id?: string;
    noLabel?: boolean;
    model: number | UserRoles | undefined;
    disabled?: boolean;
    className?: string;
    defaultRole?: UserRoles;
    oninput?: (e: Event | undefined, role?: number) => void;
  }>();

  const input: (e: Event | undefined) => void = (e) => {
    oninput && oninput("input", e, model);
  };

  const roles: { name: string; value: number }[] = [];
  for (let role in UserRoles) {
    // Skip numeric values in the reverse mapping
    if (!isNaN(Number(role))) {
      continue; // Ignore numeric keys
    }
    const roleValue = UserRoles[role as keyof typeof UserRoles]; // Get numeric value
    const roleName = UserRolesStrings[role as keyof typeof UserRolesStrings]; // Get corresponding string name
    roles.push({ value: roleValue, name: roleName });
  }

  onMount(() => {
    if (model != null) {
      return;
    }
    model = defaultRole;
  });
</script>

<Label form={id}>
  {#if !noLabel}
    {$_t(text)}
  {/if}
  <Select
    {id}
    {disabled}
    class={className}
    onchange={input}
    items={roles}
    bind:value={model}
  />
</Label>
