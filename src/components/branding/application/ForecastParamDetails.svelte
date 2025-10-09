<script lang="ts">
  import { CopyPreToClipBoard } from "$components/content";
  import type { ForecastParamDetailsProps } from "$lib";
  import { P } from "flowbite-svelte";
  let { param } = $props<{ param: ForecastParamDetailsProps }>();

  const formatFloats = (value?: number) => {
    if (typeof value === "number") {
      if (value === 0) {
        return "0";
      }
      if (Number.isInteger(value)) {
        return value.toString();
      }
      return value.toFixed(4);
    }
  };
</script>

<div class="dark:bg-gray-900 bg-white p-4 rounded-lg shadow-md mb-4 flex-col">
  <div class="flex items-center space-x-2">
    <h3 class="text-2xl font-semibold">
      {param.parameter_name}
    </h3>
    <CopyPreToClipBoard text={param.parameter_key} />
  </div>

  <P class="text-sm text-gray-600 dark:text-gray-400">
    {param.description || "No description available."}
  </P>
  <div class="mt-4">
    <h4 class="text-lg font-semibold">Parameter Details</h4>
    <ul class="list-disc list-inside">
      <li><strong>Units:</strong> {param.units}</li>
      <li><strong>Short Name:</strong> {param.short_name || ""}</li>
      <li><strong>Type of Level:</strong> {param.type_of_level}</li>
      <li><strong>Color Map:</strong> {param.color_map.colormap}</li>
      <li>
        <span class="inline-flex items-center space-x-2">
          <strong>Color Map Range:</strong>
          <div
            class="h-4 rounded-lg w-64"
            style="background: linear-gradient(to right, {param.color_map
              .colors[0]}, {param.color_map.colors[
              param.color_map.colors.length - 1
            ]})"
          ></div>
        </span>
      </li>
    </ul>

    <h4 class="text-lg font-semibold mt-4">Levels</h4>
    <ul class="list-disc list-inside">
      {#each Object.entries(param.levels) as [levelKey, levelValue]}
        <li>
          <strong>{levelKey}:</strong>
          {(levelValue as any).level.join(", ")} ({(
            levelValue as any
          ).stepType.join(", ")})
        </li>
      {/each}
    </ul>
    <h4 class="text-lg font-semibold mt-4">Notes</h4>
    <P class="text-sm text-gray-600 dark:text-gray-400">
      {param.notes || "No notes available."}
    </P>
  </div>
</div>
