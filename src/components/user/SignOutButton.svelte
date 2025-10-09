<script lang="ts">
  import { Button } from "flowbite-svelte";
  import { UserApi, siteUser, _t } from "$lib";
  export let onLogout: () => void = () => {};
  export let buttonClass = "w-full";
  export let size: "md" | "xs" | "sm" | "lg" | "xl" | undefined = undefined;
  export let color:
    | "red"
    | "yellow"
    | "green"
    | "purple"
    | "blue"
    | "light"
    | "dark"
    | "primary"
    | "none"
    | undefined = undefined;
  const api = new UserApi();
  const logout = async () => {
    onLogout();
    try {
      await api.logout();
      siteUser.set(undefined);
      location.reload();
    } catch (error) {
      console.error(error);
    }
  };
</script>

<Button {size} {color} onclick={logout} class={buttonClass}>
  {$_t("Sign out")}
</Button>
