<script lang="ts">
  import { page } from "$app/state";
  import { FormApi, siteUser, UserRoles, type FormModel } from "$lib";
  import { Accordion } from "flowbite-svelte";
  import FormListRow from "./FormListRow.svelte";
  import { PaginationControls } from "$components";
  let { onChange = $bindable() } = $props<{ onChange?: () => void }>();
  const api = new FormApi();
  let forms = $state<FormModel[]>(page.data.forms || []);
  let dataCount = $state(page.data.count || 0);
  let pageCount = $state(0);
  let loading = $state(false);
  const limit = page.data.limit || 30;
  const role = $siteUser?.role as UserRoles;
  const runQuery = async () => {
    try {
      loading = true;
      const { forms: newForms, count } = await api.all(pageCount, limit, role);
      forms = newForms;
      dataCount = count;
    } catch (e) {
      console.error("Error fetching forms:", e);
    } finally {
      loading = false;
    }
  };
  onChange = () => {
    pageCount = 0;
    runQuery();
  };
</script>

<Accordion flush>
  {#each forms as form (form.uid)}
    <FormListRow {form} />
  {/each}
</Accordion>
<PaginationControls
  bind:currentPage={pageCount}
  {limit}
  count={dataCount}
  onChange={() => runQuery()}
/>
