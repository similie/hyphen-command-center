<script lang="ts">
  import { page } from "$app/state";
  import { Toasts } from "$components";
  import { Primary } from "$layouts";
  import { siteUser, userConfig, UserApi } from "$lib";
  import { DeviceProfileStore } from "$lib/stores/deviceProfiles";
  import { onDestroy, onMount } from "svelte";
  let { children } = $props();
  const userApi = new UserApi();
  $effect(() => {
    const data = page.data;
    siteUser.set(data?.session?.user);
    if (data?.userConfig && !$userConfig) {
      userConfig.set(data.userConfig);
    }
    if (data.profiles && data.profiles.length > 0) {
      DeviceProfileStore.set(data.profiles);
    }
  });

  onMount(() => {
    userApi.runLoginCheck();
  });

  onDestroy(() => userApi.removeLoginCheck());
</script>

<Toasts />
<Primary>
  {@render children()}
</Primary>
