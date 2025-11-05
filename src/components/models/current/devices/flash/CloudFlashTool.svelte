<script lang="ts">
  import {
    _t,
    DeviceModel,
    DeviceProfile,
    LocalSocket,
    type IDevice,
    type IDeviceProfile,
    type SocketMessage,
  } from "$lib";
  import {
    Accordion,
    AccordionItem,
    Button,
    Heading,
    P,
    Spinner,
  } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import ConsoleLogger from "./ConsoleLogger.svelte";
  import DeviceFlashConfig from "./DeviceFlashConfig.svelte";
  import DestroyModelModal from "$components/models/destroy/DestroyModelModal.svelte";
  import { Toast } from "$components/toasts";

  const MAX_LOG_LINES = 200;
  let { device, flashing = $bindable() } = $props<{
    device: IDevice;
    flashing?: boolean;
  }>();
  const dApi = new DeviceModel();
  const dProfile = new DeviceProfile();
  // let building = $state(false);
  let confirmFlash = $state(false);
  let profile = $state<IDeviceProfile | null>(null);
  let loading = $state(true);
  let config = $state<{ [key: string]: any }>({});
  let buildId = $state<string>("");
  let logs = $state<string[]>([]);
  const appendLog = (line: string) => {
    logs = [...logs.slice(-MAX_LOG_LINES), line];
  };

  let timer: NodeJS.Timeout;

  const forget = () => {
    LocalSocket.instance.forget(socketTopic, onTopicMessage);
  };

  const runFailedTimer = () => {
    timer = setTimeout(() => {
      flashing = false;
      Toast.error(
        "OTA Flashing timed out. Device did not respond after reboot.",
      );
      forget();
    }, 60000);
  };
  // let testing = $state(false);
  const loadProfile = async () => {
    try {
      if (!device.profile) {
        profile = null;
        config = {};
        return;
      }
      loading = true;
      profile = await dProfile.find({ id: device.profile }).fetchOne();
      config = device.config || {};
    } catch (err) {
      console.error("Error loading device profile:", err);
      profile = null;
      config = {};
    } finally {
      loading = false;
    }
  };

  let socketTopic = $derived(`device/${device.identity}/ota/ack`);

  const onTopicMessage = (data: SocketMessage) => {
    console.log("OTA ACK topic message received:", data);
    try {
      const message = data.message.toString();
      console.log("OTA ACK topic message string:", message);
      const values = JSON.parse(message) || {};

      if (values.status === "complete") {
        clearTimeout(timer);
        appendLog("OTA Flashing complete for build: " + values.build);
        forget();
        Toast.success("OTA Flashing complete.");
        setTimeout(() => {
          flashing = false;
        }, 2000);
      } else if (values.status === "error" || values.status === "failed") {
        appendLog(`OTA Flashing error: ${values.error || "Unknown error"}`);
        flashing = false;
        forget();
      } else if (values.status === "progress") {
        appendLog(
          `OTA Flashing progress: ${values.progress || "Unknown progress"}`,
        );
      } else if (values.status === "rebooting") {
        runFailedTimer();
        appendLog("OTA Flashing: Device is rebooting...");
      } else {
        appendLog(`OTA Flashing status: ${values.status}`);
      }
    } catch (err: any) {
      console.error("Error processing OTA ACK topic message:", err);
      appendLog(`OTA Flashing error: ${err.message || "Unknown error"}`);
      return;
    }
  };

  const setupTopicListener = () => {
    LocalSocket.instance.listen(socketTopic, onTopicMessage);
  };

  const sendFlashToDevice = async (buildId: string) => {
    if (!buildId) {
      return Toast.error("Build ID is required to send flash to device.");
    }

    try {
      console.log(
        `Getting file artifact for device ${device.identity} and build ID ${buildId}`,
      );

      const config = await dApi.buildCloudFlashConfig(device.identity, buildId);
      console.log("Retrieved artifact blob:", config);
      // return processArtifactBlob(blob);
      setupTopicListener();
    } catch (err) {
      console.error("Error getting file artifact URL:", err);
    }
  };

  const sendFlash = async () => {
    console.log("Sending device to flash with profile:", profile);
    try {
      flashing = true;

      await dApi.flashDeviceLocal(device, config, async (chunks: any) => {
        if (typeof chunks === "string" && chunks.startsWith("data:")) {
          if (chunks.includes("__BUILD_ID__:")) {
            buildId = chunks.split("__BUILD_ID__:")[1].trim();
          }

          appendLog(chunks.replaceAll("data:", "").trim());

          console.log("Flash progress message:", chunks);
          return;
        }
        // onMessage(chunks);
        console.log("Flash progress chunk:", chunks);
      });

      if (!buildId) {
        throw new Error("Build ID not received from flash process.");
      }

      const sendValues = await sendFlashToDevice(buildId);
      console.log("Prepared firmware files for flashing:", sendValues);
    } catch (err) {
      console.error("Error sending device to flash:", err);
    } finally {
      // building = false;
    }
  };
  onMount(loadProfile);

  onDestroy(forget);
</script>

<DestroyModelModal
  bind:open={confirmFlash}
  title={"Confirm Flash"}
  body={"Are you sure you want to flash this device? If your configuration is invalid or incorrect, this action can take down remote systems. Please verify the device flash configuration settings are correct before proceeding. Be absolutely certain this is the action you want to perform. We cannot cancel once started"}
  onDestroy={sendFlash}
  btnText={"Yes, Flash Device"}
/>
<div class="flex flex-col w-full">
  {#if loading}
    <Heading class="text-center" tag="h5"
      >{$_t("Loading device profile...")} <Spinner /></Heading
    >
  {:else if !profile}
    <P class="text-center text-rose-500">
      {$_t("No profile assigned to device. Cannot flash firmware.")}
    </P>
  {:else if flashing}
    <ConsoleLogger {logs} />
  {:else}
    <Accordion flush>
      <AccordionItem>
        {#snippet header()}
          <P>{$_t("Device Flash Configuration")}</P>
        {/snippet}
        <DeviceFlashConfig bind:value={config} {profile} disabled={flashing} />
      </AccordionItem>
    </Accordion>
    <div class=" my-4 w-full">
      <Button
        onclick={() => (confirmFlash = true)}
        class="w-full"
        disabled={flashing}
        >{flashing
          ? $_t("Flashing...")
          : $_t("Flash Device with") + " " + profile.name}</Button
      >
    </div>
  {/if}
  <!-- <Button
    color="rose"
    onclick={() => {
      flashing = true;
      sendFlashToDevice("6ecc199b-8efb-436b-b940-425e30e0452f");
    }}>Test This Puppy</Button
  > -->

  <!-- <Button
    color="rose"
    onclick={() => {
      Toast.success("6ecc199b-8efb-436b-b940-425e30e0452f");
    }}>Cheers</Button
  > -->
</div>
