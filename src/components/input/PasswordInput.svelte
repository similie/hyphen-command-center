<script lang="ts">
  import { Button, ButtonGroup, Input } from "flowbite-svelte";
  import { _t } from "$lib";
  let {
    password = $bindable(),
    id,
    required = true,
    minCharacters = 8,
    size = "md",
    view = false,
    disabled = false,
    class: className,
    onblur,
    oninput,
    onchange,
    onkeyup,
    onkeydown,
  } = $props<{
    password: string;
    id?: string;
    required?: boolean;
    size?: "md" | "sm" | "lg" | undefined;
    minCharacters?: number;
    view?: boolean;
    disabled?: boolean;
    class?: string;
    onblur?: (e: FocusEvent) => void;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    onkeyup?: (e: KeyboardEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
  }>();
</script>

<ButtonGroup class="w-full">
  <Input
    type={view ? "text" : "password"}
    {id}
    placeholder={$_t("Password")}
    bind:value={password}
    {required}
    minlength={minCharacters}
    {size}
    {disabled}
    class={className}
    {onblur}
    {oninput}
    {onchange}
    {onkeyup}
    {onkeydown}
  />

  <Button {size} onclick={() => (view = !view)} color="alternative"
    >{$_t("View")}</Button
  >
</ButtonGroup>
