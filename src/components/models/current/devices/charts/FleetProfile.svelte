<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import { Chart } from "@flowbite-svelte-plugins/chart";
  import { onMount } from "svelte";
  import type { DeviceStatistics } from "$lib";

  let maxProfileCount: {
    profile_id: string;
    profile_name: string;
    device_count: number;
  } = $state({
    profile_id: "",
    profile_name: "",
    device_count: 0,
  });

  let maxProfilePercent = $state(0);

  let { statistics } = $props<{
    statistics: DeviceStatistics;
  }>();

  const options: ApexOptions = {
    series: [],
    colors: ["#06c4de", "#ffffff", "#f6339a", "#5ee9b5", "#FDBA8C", "#E74694"],
    chart: {
      height: 220,
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["transparent"],
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: 20,
            },
            total: {
              showAlways: true,
              show: true,

              fontFamily: "Inter, sans-serif",

              formatter: function (w) {
                return `${maxProfilePercent}%`;
              },
            },
            value: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: -20,
              formatter: function (value) {
                return value + "%";
              },
            },
          },
          size: "80%",
        },
      },
    },
    grid: {
      padding: {
        top: -2,
      },
    },
    labels: [],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "";
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value;
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

  onMount(() => {
    // Update series on mount
    // let maxCount = 0;
    for (const profile of statistics.deviceTypeCount) {
      const percent = Math.round(
        (profile.device_count / statistics.totalDevices) * 100,
      );
      options.series!.push(profile.device_count);
      options.labels!.push(profile.profile_name);

      if (percent > maxProfilePercent) {
        maxProfilePercent = percent;
        maxProfileCount = profile;
      }
    }
    options.plotOptions!.pie!.donut!.labels!.total!.label =
      maxProfileCount.profile_name;
  });
</script>

<Chart {options} class="py-6" />
