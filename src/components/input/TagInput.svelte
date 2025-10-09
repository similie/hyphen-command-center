<script lang="ts">
  import clsx from "clsx";
  import { CloseButton, P, getTheme, tags, A, Hr } from "flowbite-svelte";
  import {
    computePosition,
    offset,
    flip,
    shift,
    autoUpdate,
  } from "@floating-ui/dom";
  import { onDestroy, onMount } from "svelte";
  import { type TagKeys, type TagsProperties, _t } from "$lib";

  let {
    value = $bindable([]),
    placeholder = "Enter tags",
    class: className,
    classes,
    itemClass,
    spanClass,
    closeClass,
    inputClass,
    closeBtnSize = "xs",
    unique = false,
    availableTags = [],
    showHelper = false,
    showAvailableTags = false,
    allowNewTags = true,
    onTagAdd,
    onTagRemove,
    onTagNotAvailable,
    ...restProps
  }: TagsProperties = $props();

  const styling = $derived(
    classes ?? {
      tag: itemClass,
      span: spanClass,
      close: closeClass,
      input: inputClass,
    },
  );

  const theme = getTheme("tags");
  const {
    base,
    tag: tagCls,
    span: spanCls,
    close,
    input: inputCls,
    warning,
    error,
  } = $derived(tags());

  let inputValue = $state<TagKeys[]>([]);
  let contents: string = $state("");
  let errorMessage: string = $state("");

  let wrapperEl: HTMLDivElement; // OUTER FLEX WRAPPER
  let inputElement: HTMLInputElement;
  let inputContainer: HTMLDivElement; // THE ONLY ELEMENT WE SIZE
  // svelte-ignore non_reactive_update
  let dropdownElement: HTMLUListElement | null = null;
  let cleanupFloating: (() => void) | undefined;

  // ---------- Floating UI (unchanged) ----------
  function updateDropdownPosition() {
    if (!inputContainer || !dropdownElement) return;

    cleanupFloating?.();

    cleanupFloating = autoUpdate(
      inputContainer!,
      dropdownElement!,
      async () => {
        const { x, y } = await computePosition(
          inputContainer!,
          dropdownElement!,
          {
            placement: "bottom-start",
            middleware: [offset(4), flip(), shift()],
          },
        );
        console.log("Positioned at", x, y);
        if (!dropdownElement || !dropdownElement.style) {
          return;
        }
        Object.assign(dropdownElement!.style, {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
        });
      },
    );
  }
  const checkDropdownPosition = () => {
    if (!inputContainer) return;
  };

  // ---------- Input sizing helper (new, minimal) ----------
  const MIN_INPUT_CH = 8; // keep a visible caret area on the row

  function px(n: number) {
    return `${Math.max(0, Math.round(n))}px`;
  }

  function remainingSpaceOnLastRow(): number {
    if (!wrapperEl) return 0;

    const kids = Array.from(wrapperEl.children) as HTMLElement[];
    // all flow items except the input container
    const chips = kids.filter(
      (el) => el !== inputContainer && el.offsetParent !== null,
    );

    // find last row (largest offsetTop)
    let lastTop = 0;
    for (const el of chips) lastTop = Math.max(lastTop, el.offsetTop);

    // sum widths of items on last row
    let used = 0;
    const cStyle = getComputedStyle(wrapperEl);
    const gapX = parseFloat(cStyle.columnGap || cStyle.gap || "0") || 0;

    for (const el of chips) {
      if (el.offsetTop === lastTop) {
        used += el.getBoundingClientRect().width + gapX;
      }
    }

    // inner content width (already excludes borders/scrollbars)
    const inner = wrapperEl.clientWidth;
    // tiny buffer so we don't collide visually
    const buffer = 6;

    return Math.max(0, inner - used - buffer);
  }

  function minInputPixels(): number {
    const fs = parseFloat(getComputedStyle(inputElement).fontSize) || 16;
    // 1ch ≈ fs is fine here
    return Math.round(fs * MIN_INPUT_CH);
  }

  function sizeInputContainer() {
    if (!wrapperEl || !inputContainer || !inputElement) return;

    const rem = remainingSpaceOnLastRow();
    const minPx = minInputPixels();

    if (rem >= minPx) {
      // fit on current row exactly
      inputContainer.style.width = px(rem);
    } else {
      // move to next line and expand across that line
      inputContainer.style.width = "100%";
    }
  }
  function scheduleSize() {
    requestAnimationFrame(sizeInputContainer);
  }

  // ---------- Existing helpers (unchanged) ----------
  const wipeContents = () => {
    contents = "";
    if (inputElement) inputElement.value = "";
    errorMessage = "";
  };

  const applyValues = (tagResult?: TagKeys) => {
    if (!tagResult || !tagResult.uid) return wipeContents();

    inputValue.push(tagResult);
    value = [...value, tagResult.uid];

    wipeContents();
    scheduleSize(); // NEW: re-size after adding a chip
    onTagAdd && onTagAdd(tagResult);
  };

  const handleKeys = async (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const newTag = contents.trim();
      if (newTag.length === 0) return;

      if (!allowNewTags && availableTags.length === 0) {
        errorMessage =
          "No available tags provided. Please add available tags or enable allowNewTags.";
        return;
      }

      const isInAvailable =
        availableTags.length === 0 ||
        availableTags.some(
          (tag) => tag.tag.toLowerCase() === newTag.toLowerCase(),
        );

      const alreadyExists = inputValue.some(
        (tag) => tag.tag.toLowerCase() === newTag.toLowerCase(),
      );

      if (!allowNewTags && !isInAvailable) {
        errorMessage = `"${newTag}" is not in the available tags.`;
        return;
      } else if (isInAvailable) {
        if (alreadyExists) return wipeContents();

        const tagObj = availableTags.find(
          (tag) => tag.tag.toLowerCase() === newTag.toLowerCase(),
        );

        return applyValues(tagObj);
      }

      if (unique && alreadyExists) {
        errorMessage = `"${newTag}" is already added.`;
        return;
      }

      const tagResult = await onTagNotAvailable?.(newTag);
      if (!tagResult || !tagResult.uid) {
        errorMessage = `"${newTag}" could not be created.`;
        return;
      }
      applyValues(tagResult);
    }

    if (event.key === "Backspace" && contents.length === 0) {
      event.preventDefault();
      const lastTag = inputValue[inputValue.length - 1]?.tag ?? "";
      value = value.slice(0, -1);
      inputValue = inputValue.slice(0, -1);
      contents = lastTag;
      if (inputElement) inputElement.value = lastTag;
      errorMessage = "";
      scheduleSize(); // NEW: re-size after removing a chip
    }
  };

  const handleInput = () => {
    checkDropdownPosition();
    scheduleSize(); // NEW: re-size as user types
  };

  const deleteField = (index: number) => {
    const deletedTag = { ...inputValue[index] };
    inputValue = inputValue.filter((_, i) => i !== index);
    value = inputValue.map((tag) => tag.uid || "");
    errorMessage = "";
    scheduleSize(); // NEW
    onTagRemove && onTagRemove(deletedTag);
  };

  // ---------- Lifecycle ----------
  onMount(() => {
    const valueMap: Record<string, boolean> = {};
    value.forEach((val: string) => (valueMap[val] = true));
    for (const tag of availableTags) {
      if (valueMap[tag.uid as string]) inputValue.push(tag);
    }
    // Initial sizing + observers
    scheduleSize();

    const ro = new ResizeObserver(scheduleSize);
    ro.observe(wrapperEl);

    const mo = new MutationObserver(scheduleSize);
    mo.observe(wrapperEl, { childList: true });

    onDestroy(() => {
      ro.disconnect();
      mo.disconnect();
      cleanupFloating?.();
    });
  });

  $effect(() => {
    const trimmed = contents.trim();

    const shouldShow =
      availableTags.length > 0 &&
      trimmed !== "" &&
      inputContainer &&
      dropdownElement;

    if (!shouldShow) {
      cleanupFloating?.();
      return;
    }

    const filtered = availableTags.filter(
      (tag) =>
        tag.tag.toLowerCase().includes(trimmed.toLowerCase()) &&
        (!unique ||
          !value.some((t) => t.toLowerCase() === tag.tag.toLowerCase())),
    );

    if (filtered.length > 0) updateDropdownPosition();
    else cleanupFloating?.();
  });
</script>

<svelte:window
  on:scroll={checkDropdownPosition}
  on:resize={checkDropdownPosition}
/>

{#if showAvailableTags && availableTags.length > 0}
  <div class="mt-2">
    <!-- <P class={clsx(info(), classes?.info)}>{$_t("Available tags")}:</P> -->

    <div class="mt-1 flex flex-wrap gap-2">
      {#each availableTags as t}
        {#if inputValue.some((it) => it.uid === t.uid)}
          <P
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:text-gray-700"
          >
            {t.tag}
          </P>
        {:else}
          <A
            href="#"
            class="inline-flex items-center gap-1 rounded-lg border border-primary-300 bg-primary-50 px-2 py-1 text-sm text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onclick={() => applyValues(t)}
          >
            {t.tag}
          </A>
        {/if}
      {/each}
    </div>
  </div>
  <Hr class="my-2" />
{/if}

{#if showHelper && contents.trim().length > 0}
  {#if unique && value.some((tag) => tag.toLowerCase() === contents
          .trim()
          .toLowerCase())}
    <P class={clsx(warning(), classes?.warning)}
      >"{contents.trim()}" is already added.</P
    >
  {:else if availableTags.length > 0 && !allowNewTags && !availableTags.some((tag) => tag.tag.toLowerCase() === contents
          .trim()
          .toLowerCase())}
    <P class={clsx(error(), classes?.error)}
      >"{contents.trim()}" is not in the available tags.</P
    >
  {/if}
{/if}

<!-- OUTER WRAPPER: keep theme + user classes; just ensure wrapping & visibility -->
<div
  bind:this={wrapperEl}
  {...restProps}
  class={base({
    class: clsx(
      theme?.base,
      className,
      "flex-wrap items-start gap-2- overflow-visible-", // minimal, safe additions
    ),
  })}
>
  {#each inputValue as tag, index}
    <div
      class={tagCls({
        class: clsx(
          theme?.tag,
          styling.tag,
          "inline-flex items-center gap-1 px-2 py-1 shrink-0 ", // prevent chips from squishing horizontally
        ),
      })}
    >
      <span class={spanCls({ class: clsx(theme?.span, styling.span) })}>
        {tag.tag}
      </span>
      <div class="relative">
        <CloseButton
          type="button"
          size={closeBtnSize ?? "sm"}
          class={close({ class: clsx(theme?.close, styling.close) })}
          onclick={(e: any) => {
            e.preventDefault();
            deleteField(index);
          }}
        />
      </div>
    </div>
  {/each}

  <!-- INPUT CONTAINER: we size this one dynamically (width), keep it in flow -->
  <div class="relative flex-auto basis-0" bind:this={inputContainer}>
    <input
      bind:this={inputElement}
      onkeydown={handleKeys}
      oninput={handleInput}
      bind:value={contents}
      placeholder={value.length === 0 ? placeholder : ""}
      type="text"
      autocomplete="off"
      class={inputCls({
        class: clsx(
          styling.input,
          "w-full", // input fills the sized container; no other changes needed
        ),
      })}
    />

    {#if availableTags.length > 0 && contents.trim() !== ""}
      {@const filteredSuggestions = availableTags.filter(
        (tag) =>
          tag.tag.toLowerCase().includes(contents.trim().toLowerCase()) &&
          (!unique ||
            !inputValue.some(
              (t) => t.tag.toLowerCase() === tag.tag.toLowerCase(),
            )),
      )}
      {#if filteredSuggestions.length > 0}
        <ul
          bind:this={dropdownElement}
          class="z-10 max-h-48 w-full overflow-auto rounded border border-gray-300 bg-white shadow"
          style="position: absolute;"
        >
          {#each filteredSuggestions as suggestion}
            <li>
              <button
                type="button"
                class="block w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100 dark:text-gray-600"
                onclick={() => {
                  applyValues(suggestion);
                }}
              >
                {suggestion.tag}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</div>
