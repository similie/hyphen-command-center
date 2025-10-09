<script lang="ts">
  import { _t } from "$lib";
  import { Checkbox, Toggle } from "flowbite-svelte";
  let {
    value = $bindable(),
    onchange,
    id,
  } = $props<{
    value?: string;
    id?: string;
    onchange?: (value: string) => void;
  }>();

  const categories = ["Documents", "Images", "Videos"];
  const fileTypes = {
    Documents: [".pdf", ".docx", ".txt", ".xlsx", ".pptx", ".csv", ".odt"],
    Images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp", ".tiff"],
    Videos: [".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv"],
  };

  const setupCheckedCats = () => {
    const cat: Record<string, boolean> = {};

    for (const _cat of categories) {
      const type = fileTypes[_cat as keyof typeof fileTypes];
      for (const ext of type) {
        if (!value) {
          cat[_cat] = false;
          break;
        }

        const includes = value.includes(ext);
        if (!includes) {
          continue;
        }
        cat[_cat] = true;
        break;
      }
    }
    return cat;
  };

  const setupCheckFiletypes = () => {
    const cat: Record<string, Record<string, boolean>> = {};
    for (const _cat of categories) {
      const type = fileTypes[_cat as keyof typeof fileTypes];
      cat[_cat] = {};
      for (const ext of type) {
        cat[_cat][ext] = (value || "").includes(ext);
      }
    }
    return cat;
  };

  let checkedCategories = $state<Record<string, boolean>>(setupCheckedCats());

  let checkedFileTypes = $state<Record<string, Record<string, boolean>>>(
    setupCheckFiletypes(),
  );

  const buildValueString = () => {
    let localValue = "";
    for (const _cat of categories) {
      if (!checkedCategories[_cat]) {
        continue;
      }

      const type = fileTypes[_cat as keyof typeof fileTypes];
      for (const ext of type) {
        if (!checkedFileTypes[_cat][ext]) {
          continue;
        }
        localValue += ext + ",";
      }
    }
    return localValue.slice(0, -1);
  };

  const categoryHasSome = (category: string) => {
    let some = false;

    const type = fileTypes[category as keyof typeof fileTypes];
    for (const ext of type) {
      if (!checkedFileTypes[category][ext]) {
        continue;
      }
      some = true;
      break;
    }

    return some;
  };

  const changeMajorCategory = (category: string) => {
    // if there are none set, we will default to all
    const hasValue = checkedCategories[category];
    if (hasValue && categoryHasSome(category)) {
      return;
    }
    const type = fileTypes[category as keyof typeof fileTypes];
    for (const ext of type) {
      checkedFileTypes[category][ext] = hasValue;
    }

    value = buildValueString();
    onchange && onchange(value);
  };
</script>

{#each categories as category}
  <div class="flex flex-col mb-4 w-full">
    <Toggle
      onchange={() => changeMajorCategory(category)}
      bind:checked={checkedCategories[category]}>{$_t(category)}</Toggle
    >
    <ul
      class="flex items-center space-x-4 mt-2 ml-4 {checkedCategories[category]
        ? ''
        : 'hidden'} "
    >
      {#each fileTypes[category as keyof typeof fileTypes] as ext}
        <li class="inline-block">
          <Checkbox
            onchange={() => {
              value = buildValueString();
              onchange && onchange(value);
            }}
            bind:checked={checkedFileTypes[category][ext]}
            >{ext.replace(".", "")}</Checkbox
          >
        </li>
      {/each}
    </ul>
  </div>
{/each}

<input type="hidden" bind:value {id} />
