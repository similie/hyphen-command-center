<script lang="ts">
  import {
    DeviceModel,
    DeviceProfile,
    type IDevice,
    type IDeviceProfile,
    _t,
  } from "$lib";
  import {
    Accordion,
    AccordionItem,
    Button,
    Heading,
    P,
    Spinner,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import JSZip from "jszip";
  import DeviceFlashConfig from "./DeviceFlashConfig.svelte";
  const dApi = new DeviceModel();
  const dProfile = new DeviceProfile();
  let { device, onMessage, onStart, onFinish, onFlash, onError } = $props<{
    device: IDevice;
    onMessage: (msg: string) => void;
    onStart: () => Promise<void>;
    onFlash: (files: Array<{ address: number; data: string }>) => Promise<void>;
    onFinish: () => void;
    onError: (err: any) => void;
  }>();
  let building = $state(false);
  let profile = $state<IDeviceProfile | null>(null);
  let loading = $state(true);
  let config = $state<{ [key: string]: any }>({});
  let buildId = $state<string>("");
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
      // profile.partitions;
      console.log("Loaded device profile:", profile);
      config = device.config || {};
    } catch (err) {
      console.error("Error loading device profile:", err);
      profile = null;
      config = {};
    } finally {
      loading = false;
      console.log("WHAT IS PROFILE NOW:", loading);
    }
  };

  const processArtifactBlob = async (
    blob: Blob,
  ): Promise<Array<{ address: number; data: string }>> => {
    const zip = await JSZip.loadAsync(blob);
    const partitions = profile?.partitions || [];
    const firmwareFiles: Array<{ address: number; data: string }> = [];

    for (const part of partitions) {
      const filename = `${part.type}`; // e.g., firmware.bin, bootloader.bin
      const zipFile = zip.file(filename);
      if (!zipFile) {
        console.warn(`⚠️ Missing ${filename} in ZIP`);
        continue;
      }

      const arrayBuffer = await zipFile.async("arraybuffer");
      const uint8Array = new Uint8Array(arrayBuffer);

      let binaryData = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binaryData += String.fromCharCode(uint8Array[i]);
      }
      console.log(
        `Prepared partition ${part.type} at address ${part.address} with size ${binaryData.length} bytes`,
      );

      // Push result into flash array
      firmwareFiles.push({
        address: part.address,
        data: binaryData,
      });
    }

    return firmwareFiles;
  };

  const getFileArtifactUrl = async (buildId: string) => {
    try {
      console.log(
        `Getting file artifact for device ${device.identity} and build ID ${buildId}`,
      );
      const blob = await dApi.buildArtifact(device.identity, buildId);
      // console.log("Retrieved artifact blob:", await blob.text());
      return processArtifactBlob(blob);
    } catch (err) {
      console.error("Error getting file artifact URL:", err);
    }
  };

  const sendFlash = async () => {
    console.log("Sending device to flash with profile:", profile);
    try {
      building = true;
      await onStart();
      await dApi.flashDeviceLocal(device, config, async (chunks: any) => {
        if (typeof chunks === "string" && chunks.startsWith("data:")) {
          if (chunks.includes("__BUILD_ID__:")) {
            buildId = chunks.split("__BUILD_ID__:")[1].trim();
          }
          onMessage(chunks.replaceAll("data:", "").trim());
          console.log("Flash progress message:", chunks);
          return;
        }
        // onMessage(chunks);
        console.log("Flash progress chunk:", chunks);
      });

      if (!buildId) {
        throw new Error("Build ID not received from flash process.");
      }

      const sendValues = await getFileArtifactUrl(buildId);
      console.log("Prepared firmware files for flashing:", sendValues);
      await onFlash(sendValues || []);
      onFinish();
    } catch (err) {
      console.error("Error sending device to flash:", err);
      onError(err);
    } finally {
      building = false;
    }
  };
  onMount(loadProfile);
</script>

{#if loading}
  <Heading class="text-center" tag="h5"
    >{$_t("Loading device profile...")} <Spinner /></Heading
  >
{:else if !profile}
  <Heading class="text-center" tag="h5"
    >{$_t(
      "You must set a device profile before we can flash your device",
    )}</Heading
  >
{:else}
  <div class="flex flex-col space-y-4">
    <Accordion flush>
      <AccordionItem>
        {#snippet header()}
          <P>{$_t("Device Flash Configuration")}</P>
        {/snippet}
        <DeviceFlashConfig bind:value={config} {profile} disabled={building} />
      </AccordionItem>
    </Accordion>
    <div class="flex space-x-4 items-center">
      <Button disabled={building} class="w-full" onclick={sendFlash}
        >{$_t("Flash Device")}</Button
      >
    </div>
  </div>
{/if}
