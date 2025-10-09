<script lang="ts">
  import { Chart } from "@flowbite-svelte-plugins/chart";
  import { _t } from "$lib";
  import type { ApexOptions } from "apexcharts";
  import { onMount } from "svelte";
  type DailyUsage = {
    day: Date;
    counts: Record<string, number>;
  };
  let { dailyUsage } = $props<{
    dailyUsage: DailyUsage[];
  }>();
  const options: ApexOptions = {
    chart: {
      height: 420,
      width: "100%",
      type: "line",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    xaxis: {
      categories: dailyUsage.map((d: DailyUsage) => d.day),
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    series: [],
  };

  onMount(() => {
    const keys: string[] = [];
    for (const d of dailyUsage) {
      for (const key in d.counts) {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
    }

    const series: { name: string; data: number[] }[] = [];
    // const counts: Record<string, Record<>> = {};
    for (const d of dailyUsage) {
      for (const key of keys) {
        const value = d.counts[key] || 0;
        const existing = series.find((s) => s.name === key);
        if (existing) {
          existing.data.push(value);
        } else {
          series.push({ name: key, data: [value] });
        }
      }
    }

    options.series = series;
  });
</script>

<div
  class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex w-full flex-col p-4 sm:p-6"
>
  <h5 class="me-1 text-xl leading-none font-bold text-gray-900 dark:text-white">
    {$_t("30 Day Routes Access")}
  </h5>
  <Chart {options} />
</div>
