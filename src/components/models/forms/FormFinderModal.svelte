<script lang="ts">
  import { PaginationControls } from "$components/input";
  import { _t, FormApi, type FormModel, type UserRoles, type UUID } from "$lib";
  import { Button, Heading, Modal } from "flowbite-svelte";
  import { onMount } from "svelte";

  let {
    open = $bindable(),
    role,
    onSelect,
    filter,
  } = $props<{
    open: boolean;
    role: UserRoles;
    onSelect: (form: FormModel) => void;
    filter: UUID[];
  }>();
  const api = new FormApi();
  let forms = $state<FormModel[]>([]);
  let dataCount = $state(0);
  let pageCount = $state(0);
  let loading = $state(false);
  const limit = 30;
  const runQuery = async () => {
    try {
      loading = true;
      const { forms: newForms, count } = await api.all(pageCount, limit, role);
      forms = newForms.filter((form: FormModel) => !filter.includes(form.uid));
      dataCount = count;
    } catch (e) {
      console.error("Error fetching forms:", e);
    } finally {
      loading = false;
    }
  };

  onMount(runQuery);
</script>

<Modal title="Available Forms" bind:open>
  <div class="p-4">
    <!-- <Heading tag="h3">{$_t("Available Forms")}</Heading> -->
    <ul class="w-full">
      {#each forms as form (form.uid)}
        <li
          class="rounded-lg dark:bg-gray-600 bg-gray-200 p-4 mb-2 flex align-center"
        >
          <Heading tag="h4">{form.name}</Heading>

          <Button size="sm" class="ml-auto" onclick={() => onSelect(form)}
            >{$_t("Select")}</Button
          >
        </li>
      {/each}
    </ul>
  </div>
  <PaginationControls
    bind:currentPage={pageCount}
    {limit}
    count={dataCount}
    onChange={() => runQuery()}
  />
</Modal>
