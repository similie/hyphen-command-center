<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import { Chart } from "@flowbite-svelte-plugins/chart";
  import type { DeviceStatistics, WeekStreamCount } from "$lib";
  import { onMount } from "svelte";

  // WeekStreamCount
  let { statistics } = $props<{ statistics: DeviceStatistics }>();
  let options: ApexOptions = {
    chart: {
      height: "300px",
      type: "line",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
      curve: "smooth",
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 20,
        right: 2,
        top: -26,
      },
    },
    series: [],
    legend: {
      show: false,
    },
    xaxis: {
      categories: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
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
    yaxis: {
      show: false,
    },
  };

  onMount(() => {
    const groupedData: Record<string, WeekStreamCount[]> = {};

    for (const item of statistics.deviceWeeklyCounts) {
      if (!groupedData[item.week_label]) {
        groupedData[item.week_label] = [];
      }
      groupedData[item.week_label].push(item);
    }

    /**  {
        name: "Clicks",
        data: [6500, 6418, 6456, 6526, 6356, 6456],
        color: "#1A56DB",
      },
      {
        name: "CPC",
        data: [6456, 6356, 6526, 6332, 6418, 6500],
        color: "#7E3AF2",
      },
     */
    const colors = [
      "#06c4de",
      //   "#ff637e",
      "#1A56DB",
      //   "#f6339a",
      "#7E3AF2",
      "#5ee9b5",
      "#F59E0B",
      "#EF4444",
      "#10B981",
    ];
    for (const name in groupedData) {
      const data: number[] = groupedData[name].map((item) => item.stream_count);
      if (!(options.series as ApexAxisChartSeries[] | undefined)) {
        options.series = [];
      }
      (options.series as ApexAxisChartSeries[] | undefined)?.push({
        name,
        data,
        color: colors.shift() || "#000000",
      });
    }
  });
</script>

<Chart {options} />
