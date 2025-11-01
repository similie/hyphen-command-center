<script lang="ts">
  import {
    A,
    AccordionItem,
    Button,
    Card,
    Heading,
    Hr,
    NavLi,
    NavUl,
    P,
    Select,
    Spinner,
    TabItem,
    Tabs,
  } from "flowbite-svelte";
  import { onDestroy } from "svelte";
  import { _t, type IDevice } from "$lib"; // adjust import path as needed

  import {
    flashESP32WithCerts,
    type FlashOptions,
    defaultFlashOptions,
  } from "$lib/utils/flash-tools";
  import { ArrowUpRightFromSquareOutline } from "flowbite-svelte-icons";
  import FlashTable from "./FlashTable.svelte";
  import FlashOptionsSelect from "./FlashOptionsSelect.svelte";
  import ConsoleLogger from "./ConsoleLogger.svelte";
  import LocalFlasher from "./LocalFlasher.svelte";
  import { Toast } from "$components/toasts";

  let { device } = $props<{ device: IDevice }>();
  const MAX_LOG_LINES = 200;

  let baudRate = $state(115200);
  let options = $state<FlashOptions>(defaultFlashOptions);
  let binFiles = $state<{ address: number; data: string }[]>([]);
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let port: any = null;
  let connecting = $state(false);
  let breakLoop = $state(false);
  let connected = $state(false);
  let logs = $state<string[]>([]);
  let isFlashing = $state(false);
  let logBuffer: string[] = [];

  const connectBaudRates = [
    { name: "9600", value: 9600 },
    { name: "19200", value: 19200 },
    { name: "38400", value: 38400 },
    { name: "57600", value: 57600 },
    { name: "115200", value: 115200 },
    { name: "230400", value: 230400 },
    // {name: "460800", value: 460800},
  ];

  const appendLog = (line: string) => {
    logs = [...logs.slice(-MAX_LOG_LINES), line];
  };
  const nl = (val: string) => {
    return val.endsWith("\r") ? val : val + "\r";
  };
  const safeDisconnect = async () => {
    if (!port) return;
    appendLog(nl("🔌 Disconnecting..."));
    breakLoop = true;

    try {
      // 🧹 stop ongoing read safely
      if (reader) {
        appendLog(nl("🧹 Cancelling console reader..."));
        await reader.cancel().catch(() => {});
        try {
          reader.releaseLock();
        } catch {}
        reader = null;
      }

      // ⚙️ allow time for stream to unlock
      await new Promise((r) => setTimeout(r, 50));

      // 🔒 now safely close
      if (port.readable || port.writable) {
        await port.close();
        appendLog(nl("✅ Port closed cleanly."));
      } else {
        appendLog(nl("ℹ️ Port already closed."));
      }
    } catch (err) {
      appendLog(nl(`⚠️ Error closing port: ${(err as Error).message}`));
    } finally {
      connected = false;
      port = null;
      breakLoop = false; // reset after closure
    }
  };

  const pauseLogging = async () => {
    if (!reader) return;
    appendLog(nl("🧹 Pausing serial log..."));
    breakLoop = true;
    try {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    } catch {}
    reader = null;
    await new Promise((r) => setTimeout(r, 50)); // ensure settled
    appendLog(nl("✅ Logging paused."));
  };

  const connectDevice = async () => {
    try {
      connecting = true;
      port = await (navigator as any).serial.requestPort({ filters: [] });
      await port.open({ baudRate });
      appendLog(nl(`✅ Port opened for device ${device.identity}`));
      connected = true;
      await readLoop();
    } catch (err) {
      appendLog(nl(`❌ Connect error: ${(err as Error).message || err}`));
    } finally {
      connecting = false;
    }
  };

  const FLUSH_INTERVAL = 100; // ms
  let flushTimer: NodeJS.Timeout;

  const startFlushLoop = () => {
    clearInterval(flushTimer);
    flushTimer = setInterval(() => {
      if (logBuffer.length === 0) return;

      // Take all logs in buffer at once
      const chunk = logBuffer.join("");
      logBuffer = [];

      // Append to reactive logs (only 10x/sec)
      logs = [...logs.slice(-MAX_LOG_LINES), chunk];
    }, FLUSH_INTERVAL);
  };
  const readLoop = async () => {
    if (!port) return;
    reader = port.readable!.getReader();
    const decoder = new TextDecoder();
    startFlushLoop();
    try {
      while (!breakLoop) {
        if (!reader) {
          continue;
        }
        const { value, done } = await reader?.read();
        if (done || breakLoop) break;
        if (value) logBuffer.push(decoder.decode(value));
      }
    } catch (err) {
      console.warn("Read error:", err);
      if (!breakLoop)
        appendLog(nl(`⚠️ Console read error: ${(err as Error).message}`));
    } finally {
      reader?.releaseLock();
    }
  };

  const runFlasher = async (
    binFiles: Array<{ address: number; data: string }>,
    localOptions?: FlashOptions,
  ) => {
    await flashESP32WithCerts(
      port,
      binFiles,
      (idx: number, written: number, total: number, content) => {
        appendLog(
          nl(
            `🔄 Flashing segment #${idx}: ${written}/${total}${!content ? "" : content}`,
          ),
        );
      },
      localOptions || options,
    );
  };

  const reopenPort = async () => {
    if (!port) return;
    try {
      if (port.readable && port.writable) {
        await pauseLogging();
        await port.close();
      }
      await new Promise((r) => setTimeout(r, 500));
      await port.open({ baudRate });
      appendLog(nl("✅ Port reopened."));
    } catch (err) {
      appendLog(nl(`❌ Reopen failed: ${(err as Error).message || err}`));
    }
  };

  const flashFirmware = async () => {
    if (!port) {
      appendLog(nl("❌ No device connected."));
      return;
    }

    if (!binFiles || !binFiles.length || !binFiles.every((f) => f.data)) {
      appendLog(nl("❌ Firmware file data not ready."));
      return;
    }

    appendLog(nl("▶️ Starting firmware flash..."));
    isFlashing = true;

    try {
      await pauseLogging();
      await port.close();
      console.log("🚀 Firmware file prepared for flashing");
      await runFlasher(binFiles);
      appendLog(
        nl("✅ Flash completed. You may need manually reset the device."),
      );
      await reopenPort();
    } catch (err) {
      appendLog(nl(`❌ Flash failed: ${(err as Error).message || err}`));
    } finally {
      isFlashing = false;
    }
  };
  let cloudView = $state(false);
  // Cleanup on component destroy
  onDestroy(async () => {
    connected = false;
    breakLoop = true;
    await safeDisconnect();
    // await readingCmd("stop");
  });
</script>

<Card
  class="max-w-full mx-auto mt-8 p-4 dark:bg-gray-900 flex flex-col space-y-2"
>
  <div class="flex w-full items-center">
    <Heading tag="h5">{$_t("Device")}: {device.name}</Heading>
    <div class="ml-auto flex space-x-2 items-center">
      <A
        href="#"
        disabled={connected && !cloudView}
        color={cloudView ? "gray" : "primary"}
        onclick={() => {
          cloudView = false;
        }}>{$_t("Local")}</A
      >
      <A
        href="#"
        color={!cloudView ? "gray" : "primary"}
        disabled={connected && cloudView}
        onclick={() => {
          if (connected) {
            return Toast.error(
              $_t("Disconnect the device to use Cloud Flashing."),
            );
          }
          cloudView = true;
        }}>{$_t("Cloud")}</A
      >
    </div>
  </div>
  <Hr class="my-4" />
  {#if !connected && !cloudView}
    <div class="flex space-x-4 items-center">
      <div class="w-full flex-grow-1 flex">
        <Button
          color="primary"
          onclick={connectDevice}
          class=" w-full"
          disabled={connecting}
        >
          {#if connecting}
            <Spinner size={"4"} class="mr-2" />
          {/if}
          {$_t("Connect to Device")}
        </Button>
      </div>
      <Select
        class="ml-auto"
        bind:value={baudRate}
        disabled={connecting}
        items={connectBaudRates}
      />
    </div>
  {:else if connected && !cloudView}
    <div class="flex items-center mb-4">
      <P class="text-primary-600 dark:text-primary-600 "
        >{$_t("Device connected")}: {device.identity}</P
      >
      <A class="ml-auto" onclick={() => safeDisconnect()}
        ><ArrowUpRightFromSquareOutline /> {$_t("Disconnect")}</A
      >
    </div>

    <Tabs>
      <TabItem open title={$_t("Local Flashing")}>
        <!-- Flashing tool content here -->
        <div class="flex flex-col space-y-4">
          <FlashOptionsSelect bind:options></FlashOptionsSelect>
          <LocalFlasher
            {device}
            onStart={async () => {
              try {
                isFlashing = true;
                await pauseLogging();
                await port.close();
                appendLog(nl("▶️ Local flashing started..."));
              } catch {}
            }}
            onFlash={async (
              files: Array<{ address: number; data: string }>,
            ) => {
              appendLog(nl("✅ Flashing started started."));
              if (!files || !files.length) {
                appendLog(nl("⚠️ No firmware files provided for flashing."));
                return;
              }
              await runFlasher(files);
            }}
            onFinish={() => {
              isFlashing = false;
              appendLog(nl("✅ Flashing finished."));
              reopenPort();
            }}
            onError={(err) => {
              isFlashing = false;
              appendLog(
                nl(`❌ Flashing error: ${(err as Error).message || err}`),
              );
              reopenPort();
            }}
            onMessage={(msg: string) => {
              appendLog(msg);
            }}
          />
        </div>
      </TabItem>
      <TabItem title={$_t("Manual Flashing")}>
        <FlashOptionsSelect bind:options>
          <AccordionItem>
            {#snippet header()}
              <P>{$_t("Manual Flashing")}</P>
            {/snippet}
            <P italic>
              {$_t(
                "This utility has only been tested with Similie-supported, ESP32-based Hyphen devices",
              )}
            </P>
            <FlashTable
              bind:value={binFiles}
              onFlash={flashFirmware}
              bind:flashing={isFlashing}
            />
          </AccordionItem>
        </FlashOptionsSelect>
      </TabItem>
    </Tabs>

    <div class="mt-6">
      <ConsoleLogger {logs} />
    </div>
  {:else if cloudView}
    <P>{$_t("Cloud Flashing is not yet implemented.")}</P>
  {/if}
</Card>
