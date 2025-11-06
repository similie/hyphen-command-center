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
    Card,
    Heading,
    Hr,
    P,
    Progressbar,
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
  let complete = $state(false);
  let error = $state(0);
  let progress = $state(0);
  let profile = $state<IDeviceProfile | null>(null);
  let loading = $state(true);
  let config = $state<{ [key: string]: any }>({});
  let buildId = $state<string>("");
  let logs = $state<string[]>([]);
  const appendLog = (line: string) => {
    logs = [...logs.slice(-MAX_LOG_LINES), line];
  };

  const nl = (val: string) => {
    return val.endsWith("\r") ? val : val + "\r";
  };

  let timer: NodeJS.Timeout;

  const forget = () => {
    LocalSocket.instance.forget(socketTopic, onTopicMessage);
  };

  const reset = () => {
    flashing = false;
    complete = false;
    error = 0;
    progress = 0;
    buildId = "";
    logs = [];
  };

  const runFailedTimer = () => {
    const errorMessage =
      "OTA Flashing timed out. Device did not respond after reboot.";
    timer = setTimeout(() => {
      flashing = false;
      error = 500;
      appendLog(nl(errorMessage));
      Toast.error(errorMessage);
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

  const completeFlash = () => {
    clearTimeout(timer);
    appendLog(nl("OTA Flashing complete for build: " + buildId));
    forget();
    Toast.success("OTA Flashing complete.");
    setTimeout(() => {
      complete = true;
      progress = 0;
      flashing = false;
    }, 2000);
  };

  let socketTopic = $derived(`device/${device.identity}/ota/ack`);

  const onTopicMessage = (data: SocketMessage) => {
    console.log("OTA ACK topic message received:", data);
    try {
      const message = data.message; //.toString();
      const values = JSON.parse(message) || {};

      if (values.status === "complete") {
        completeFlash();
      } else if (values.status === "started") {
        appendLog(
          nl(
            "OTA Flashing started on device. This can take several minutes and may appear to have stalled.",
          ),
        );
      } else if (values.status === "error" || values.status === "failed") {
        error = values.code ?? 0;
        appendLog(nl(`OTA Flashing error: ${values.error || "Unknown error"}`));
        flashing = false;
        forget();
      } else if (values.status === "progress") {
        progress = values.progress || 0;
        appendLog(
          nl(
            `OTA Flashing progress: ${values.progress + "%" || "Unknown progress"}`,
          ),
        );
      } else if (values.status === "rebooting") {
        runFailedTimer();
        progress = 100;
        appendLog(nl("OTA Flashing: Device is rebooting..."));
      } else {
        appendLog(nl(`OTA Flashing status: ${values.status}`));
      }
    } catch (err: any) {
      console.error("Error processing OTA ACK topic message:", err);
      appendLog(nl(`OTA Flashing error: ${err.message || "Unknown error"}`));
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

      await sendFlashToDevice(buildId);
      console.log("Prepared firmware files for flashing", buildId);
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
  {:else if complete}
    <Card class=" max-w-full p-3 flex flex-col space-y-4">
      <Heading tag="h5" class=" text-center ">
        {$_t("OTA Flashing complete! Your device was updated successfully.")}
      </Heading>
      <P class=" text-center font-bold">{$_t("Build ID")}: {buildId}</P>
      <Hr class="my-4" />
      <Button color="alternative" onclick={reset}>{$_t("Flash Again")}</Button>
    </Card>
  {:else if error !== 0}
    <Card
      class="bg-rose-600 mb-6 dark:bg-rose-600 max-w-full p-3 flex flex-col space-y-4"
    >
      <Heading tag="h5" class="text-white dark:text-white text-center ">
        {$_t(
          "There was an error during OTA Flashing. Please review the logs for details.",
        )}
      </Heading>
      <P class="text-center text-white">{$_t("Error code:")} {error}</P>
      <P class="text-white text-center font-bold"
        >{$_t("Build ID")}: {buildId || "Unknown"}</P
      >
      <Hr class="my-4" />
      <Button color="light" onclick={reset}>{$_t("Try Again")}</Button>
    </Card>
    <ConsoleLogger {logs} />
  {:else if flashing}
    <ConsoleLogger {logs} />
    {#if progress > 0}
      <Hr class="my-2" />
      <Progressbar {progress} />
    {/if}
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
</div>
