<script lang="ts">
  import { page } from "$app/state";
  import { Primary } from "$layouts";
  import { siteUser, userConfig, UserApi } from "$lib";
  import { onDestroy, onMount } from "svelte";
  let { children } = $props();
  const userApi = new UserApi();
  $effect(() => {
    const data = page.data;
    siteUser.set(data?.session?.user);
    if (data?.userConfig && !$userConfig) {
      userConfig.set(data.userConfig);
    }
  });

  onMount(() => {
    userApi.runLoginCheck();
  });

  onDestroy(() => userApi.removeLoginCheck());
</script>

<Primary>
  {@render children()}
</Primary>
