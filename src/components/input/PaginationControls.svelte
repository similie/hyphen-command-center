<script lang="ts">
  import { Pagination, PaginationNav } from "flowbite-svelte";
  export let onChange: (skip: number, limit: number) => void | Promise<void>;
  export let limit = 30;
  export let skip = 0;
  export let count;
  export let currentPage = 0;

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
      { length: Math.ceil(count / limit) },
      (_, i) => i + 1,
    ).map((val) => {
      return { name: val.toString() };
    });
    if (pages.length === 0) {
      return;
    }
    pages[currentPage].active = true;
  };

  const pullDocuments = () => {
    skip = currentPage * limit;
    return onChange(skip, limit);
  };

  const previous = () => {
    if (currentPage === 0) {
      return;
    }
    currentPage--;

    setActive();
    pullDocuments();
  };
  const next = () => {
    if (currentPage === pages.length - 1) {
      return;
    }
    currentPage++;
    setActive();
    pullDocuments();
  };
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.tagName !== "BUTTON") {
      return;
    }

    const pageNumber = target.textContent?.trim() || "";
    const parsedPageNumber = parseInt(pageNumber);
    if (isNaN(parsedPageNumber)) {
      return;
    }
    currentPage = parsedPageNumber - 1;
    setActive();
    pullDocuments();
  };
  let lastCount = 0;
  $: {
    if (count !== lastCount) {
      setPages();
      lastCount = count;
    }
  }

  function handlePageChange(page: number) {
    currentPage = page;
    // Additional logic here
    setActive();
    pullDocuments();
  }
</script>

{#if count > limit}
  <!-- <Pagination
    class="mt-8 flex justify-end"
    {pages}
    {currentPage}
    onprevious={previous}
    onnext={next}
    onclick={handleClick}
  /> -->
  <PaginationNav
    totalPages={count}
    {currentPage}
    onPageChange={handlePageChange}
  />
{/if}
