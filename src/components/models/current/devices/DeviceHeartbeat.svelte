<script lang="ts">
  import { DateFormat } from "$components";
  import { InputFormItem, InputItemsRow } from "$components/input";
  import { HeartbeatModel, _t, type IDevice, type IHeartbeat } from "$lib";
  import { A, Card, Heading, Label, P, Skeleton, Span } from "flowbite-svelte";
  import { RefreshOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  let { device } = $props<{ device: IDevice }>();
  const api = new HeartbeatModel();
  let heartbeat = $state<IHeartbeat | undefined>();
  let loading = $state(false);
  const fetchLatestHeartbeat = async () => {
    try {
      loading = true;
      heartbeat = await api
        .find({ device: device.identity })
        .sort({ createdAt: "DESC" })
        .limit(1)
        .fetchOne();
      console.log("Fetched latest heartbeat", heartbeat);
    } catch {
      console.error("Error fetching latest heartbeat");
    } finally {
      loading = false;
    }
  };
  onMount(fetchLatestHeartbeat);
</script>

<Card
  class="w-full dark:bg-gray-950 flex flex-col p-6 max-w-full overflow-hidden"
>
  {#if loading}
    <Skeleton />
  {:else if heartbeat}
    <InputItemsRow class="items-end">
      <InputItemsRow class="items-center space-x-2">
        <Heading tag="h5" class="text-primary-600"
          >{$_t("Device Vitals")}</Heading
        >

        {#if heartbeat && heartbeat.cell && Object.keys(heartbeat.cell).length}
          <P>({$_t("Cellular")})</P>
        {:else}
          <P>({$_t("WiFi")})</P>
        {/if}
      </InputItemsRow>
      <InputItemsRow class="items-center">
        <Label class="text-md" color="primary">{$_t("Updated")}:</Label>
        <DateFormat stamp={heartbeat.createdAt} />
      </InputItemsRow>

      <A onclick={fetchLatestHeartbeat} class="ml-auto"><RefreshOutline /></A>
    </InputItemsRow>
    <div class="my-3"></div>
    {#if heartbeat && heartbeat.cell && Object.keys(heartbeat.cell).length}
      <InputItemsRow>
        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("IMEI")}:</Label>
          <P>{heartbeat.cell!.IMEI || "N/A"}</P>
        </InputItemsRow>

        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("CCID")}:</Label>
          <P>{heartbeat.cell!.ccid || "N/A"}</P>
        </InputItemsRow>
      </InputItemsRow>

      <InputItemsRow>
        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("Operator")}:</Label>
          <P>{heartbeat.cell!.op || "N/A"}</P>
        </InputItemsRow>

        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("Model")}:</Label>
          <P>{heartbeat.cell!.modem || "N/A"}</P>
        </InputItemsRow>
      </InputItemsRow>

      <InputItemsRow>
        <InputItemsRow>
          <Label class="text-md" color="primary"
            >{$_t("Signal Strength")}:</Label
          >
          <P>{heartbeat.cell!.sig_q || "N/A"}</P>
        </InputItemsRow>

        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("Temperature")}:</Label>
          <P>{heartbeat.cell!.temp || "N/A"}°C</P>
        </InputItemsRow>
      </InputItemsRow>
    {:else if heartbeat && heartbeat.network && Object.keys(heartbeat.network).length}
      <InputItemsRow>
        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("SSID")}:</Label>
          <P>{heartbeat.network!.ssid || "N/A"}</P>
        </InputItemsRow>

        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("RSSI")}:</Label>
          <P>{heartbeat.network!.rssi || "N/A"}</P>
        </InputItemsRow>
      </InputItemsRow>

      <InputItemsRow>
        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("Gateway")}:</Label>
          <P>{heartbeat.network!.g_ip || "N/A"}</P>
        </InputItemsRow>

        <InputItemsRow>
          <Label class="text-md" color="primary">{$_t("IP")}:</Label>
          <P>{heartbeat.network!.l_ip || "N/A"}</P>
        </InputItemsRow>
      </InputItemsRow>
    {/if}
    <div class="my-3"></div>
    <InputItemsRow>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Battery")}</Span
          >:
          {Math.ceil(heartbeat.pow.bat)}%</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Voltage")}</Span
          >: {heartbeat.pow.v_cel.toFixed(2)}v</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Current")}</Span
          >: {heartbeat.pow.current.toFixed(2)}</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Solar")}</Span
          >: {heartbeat.pow.solar_v.toFixed(2)}v</P
        >
      </InputFormItem>
    </InputItemsRow>

    <InputItemsRow>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Free")}</Span
          >:
          {Math.ceil(heartbeat.sys.free / 1000)}KB</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Total")}</Span
          >: {Math.ceil(heartbeat.sys.mem / 1000)}KB</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Uptime")}</Span
          >: {heartbeat.sys.up}</P
        >
      </InputFormItem>
      <InputFormItem>
        <P
          ><Span class="text-primary-600 dark:text-primary-600"
            >{$_t("Version")}</Span
          >: {heartbeat.sys.v}</P
        >
      </InputFormItem>
    </InputItemsRow>

    <!---->
  {:else}
    <P class="text-center" italic>{$_t("No heartbeat data available")}</P>
  {/if}
</Card>
