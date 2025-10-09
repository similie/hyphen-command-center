<script lang="ts">
  import {
    type ApplicationModel,
    FormApplicationApi,
    type UUID,
    UserRoles,
    applicationStore,
    siteUser,
    _t,
    type FormField,
  } from "$lib";
  import { P, Select } from "flowbite-svelte";
  import { onMount } from "svelte";
  let {
    value = $bindable(),
    onchange,
    oninput,
    required,
    id,
    field = $bindable(),
  } = $props<{
    value?: UUID;
    field?: FormField;
    onchange?: (value: UUID) => void;
    oninput?: (value: UUID) => void;
    required?: boolean;
    id?: string;
  }>();
  const api = new FormApplicationApi();
  let applications = $state<ApplicationModel[]>([]);

  const storageApps = () => {
    return new Promise<ApplicationModel[]>((resolve) => {
      const un = applicationStore.subscribe((apps) => {
        resolve(apps);
      });
      un();
    });
  };

  const apiApplications = () => {
    return api.all(0, 100, $siteUser?.role || UserRoles.BLOCKED);
  };

  const getApplications = async () => {
    let apps = await storageApps();
    if (!apps || !apps.length) {
      const results = await apiApplications();
      apps = results.applications;
      applicationStore.set(apps);
    }
    applications = apps.filter((app: ApplicationModel) => app.active);
  };

  onMount(getApplications);

  const onChangeLocal = () => {
    onchange?.(value);
    oninput?.(value);
  };
</script>

{#if !applications.length}
  <P>{$_t("Applications current unavailable")}</P>
{:else}
  <Select
    onchange={onChangeLocal}
    bind:value
    {id}
    {required}
    items={applications.map((a) => ({ value: a.uid, name: a.name }))}
  ></Select>
{/if}
