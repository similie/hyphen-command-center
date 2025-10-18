<script lang="ts">
  import { PaginationNav } from "flowbite-svelte";
  let {
    onChange,
    limit = 30,
    skip = 0,
    count,
    currentPage = $bindable(1),
  } = $props<{
    onChange: (skip: number, limit: number) => void | Promise<void>;
    limit?: number;
    skip?: number;
    count: number;
    currentPage?: number;
  }>();

  let pages: { name: string; active?: boolean }[] = [];
  const setActive = () => {
    const thesePages = [...pages];
    for (let i = 0; i < thesePages.length; i++) {
      const page = thesePages[i];
      page.active = currentPage === i;
    }
    pages = thesePages;
  };

  const setPages = () => {
    pages = Array.from(
      { length: Math.ceil(count / (limit ?? 1)) },
      (_, i) => i + 1,
    ).map((val) => {
      return { name: val.toString() };
    });
    if (pages.length === 0) {
      return;
    }
    pages[currentPage - 1].active = true;
  };

  const pullDocuments = () => {
    skip = (currentPage - 1) * limit;
    return onChange(skip, limit);
  };

  let lastCount = 0;
  $effect(() => {
    if (count !== lastCount) {
      setPages();
      lastCount = count;
    }
  });

  function handlePageChange(page: number) {
    currentPage = page;
    // Additional logic here
    setActive();
    pullDocuments();
  }
</script>

{#if count > limit}
  <PaginationNav
    totalPages={Math.ceil(count / (limit ?? 1))}
    {currentPage}
    onPageChange={handlePageChange}
  />
{/if}
