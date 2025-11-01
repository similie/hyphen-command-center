<script lang="ts">
  import type { ApexOptions } from "apexcharts";
  import { Chart } from "@flowbite-svelte-plugins/chart";
  import { onMount } from "svelte";
  import type { DeviceStatistics } from "$lib";

  let { statistics } = $props<{
    statistics: DeviceStatistics;
  }>();

  let onlinePercentage = $derived(
    statistics.totalDevices
      ? Math.round((statistics.onlineDevices / statistics.totalDevices) * 100)
      : 0,
  );
  let offlinePercentage = $derived(
    statistics.totalDevices
      ? Math.round((statistics.offlineDevices / statistics.totalDevices) * 100)
      : 0,
  );

  const options: ApexOptions = {
    series: [],
    colors: [
      "#06c4de",
      "#ffffff",
      "#ff637e",
      "#f54a00",
      "#5ee9b5",
      "#FDBA8C",
      "#E74694",
    ],
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
              label: "Devices Online",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                return `${onlinePercentage}%`;
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
    labels: ["Online", "Offline"],
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

  onMount(() => {
    // Update series on mount
    options.series = [onlinePercentage, offlinePercentage];
  });
</script>

<Chart {options} class="py-6" />
