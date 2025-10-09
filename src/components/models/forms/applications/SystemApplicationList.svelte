<script lang="ts">
  import { page } from "$app/state";
  import { PaginationControls } from "$components/input";
  import { FormApplicationApi, siteUser, type ApplicationModel } from "$lib";
  import { Accordion } from "flowbite-svelte";
  import SystemApplicationRow from "./SystemApplicationRow.svelte";

  const sq = new FormApplicationApi();
  const limit = page.data.limit || 30;
  let loading = $state(false);
  let dataCount = $state(page.data.count || 0);
  let pageCount = $state(0);
  let { onChange = $bindable() } = $props<{ onChange?: () => void }>();
  let applications = $state<ApplicationModel[]>(page.data.applications || []);
  const runQuery = async () => {
    try {
      loading = true;
      const forms = await sq.all(pageCount, limit, $siteUser!.role, true);
      const { applications: apps, count } = forms;
      applications = apps;
      dataCount = count;
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      loading = false;
    }
  };
  const removeApplication = async (app: ApplicationModel) => {
    try {
      await sq.destroy({ uid: app.uid });
      applications = applications.filter((a) => a.uid !== app.uid);
      runQuery();
    } catch (error) {
      console.error("Error removing application:", error);
    }
  };
  onChange = () => {
    runQuery();
  };
</script>

<Accordion flush>
  {#each applications as application (application.uid)}
    <SystemApplicationRow {application} onRemove={removeApplication} />
  {/each}
</Accordion>
<PaginationControls
  bind:currentPage={pageCount}
  {limit}
  count={dataCount}
  onChange={() => runQuery()}
/>
