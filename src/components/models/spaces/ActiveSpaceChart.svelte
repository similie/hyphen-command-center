<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import { Card, Popover } from "flowbite-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import { _t } from "$lib";
  import { Chart } from "@flowbite-svelte-plugins/chart";
  type planCount = { plan: string; count: number };

  let { counts } = $props<{ counts: planCount[] }>();

  const all = counts.find(
    (f: { plan: string; count: number }) => f.plan === "all",
  );
  const filterCounts = (counts: planCount[]) => {
    return counts.filter((c: planCount) => c.plan !== "all");
  };

  const options: ApexOptions = {
    series: filterCounts(counts).map((c: planCount) =>
      Math.round((c.count / all.count) * 100),
    ),
    // colors: ["#1C64F2", "#16BDCA", "#9061F9"],
    chart: {
      height: "350",
      // fill: true,
      width: "100%",
      type: "pie",
    },
    stroke: {
      colors: ["white"],
    },
    plotOptions: {
      pie: {
        // dataLabels: {
        //   offset: 25,
        // },
      },
    },
    labels: filterCounts(counts).map((c: planCount) => c.plan),
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
      // floating: true,
      // height:
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
  };
</script>

<Card class="p-4 md:p-6">
  <div class="flex w-full items-start justify-between">
    <div class="flex-col items-center">
      <div class="mb-1 flex items-center">
        <h5
          class="me-1 text-xl leading-none font-bold text-gray-900 dark:text-white"
        >
          {$_t("Active Plans")}
        </h5>
        <InfoCircleSolid
          id="pie1"
          class="ms-1 h-3.5 w-3.5 cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
        <Popover
          triggeredBy="#pie1"
          class="z-10 w-72 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 shadow-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          <div class="space-y-2 p-3">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {$_t("Active Plan Percentage")}
            </h3>
            <p>
              {$_t(
                "This chart shows the percentage of active plans in your community.",
              )}
            </p>
          </div></Popover
        >
      </div>
    </div>
  </div>

  <Chart {options} class="py-6" />
</Card>
