import {
  ESPLoader,
  Transport,
  type IEspLoaderTerminal,
  type LoaderOptions,
} from "esptool-js";

export type FlashOptions = {
  flashMode: string;
  flashFreq: string;
  eraseAll: boolean;
  flashSize: string;
  baudRate: number;
};

export const defaultFlashOptions: FlashOptions = {
  flashMode: "dio",
  flashFreq: "40m",
  eraseAll: false,
  flashSize: "16MB",
  baudRate: 460800,
};

/**
 * Flash an ESP32 with firmware and certificate files.
 * @param port SerialPort acquired from navigator.serial.requestPort()
 * @param certZipBlob ZIP blob containing certs (device-cert.pem, private-key.pem, root-ca.pem)
 * @param firmware Uint8Array of firmware binary
 * @param firmwareOffset Starting offset for firmware (default 0x10000)
 * @param fsOffset Starting offset for filesystem (your data partition)
 * @param flashSize String like "16MB"
 */
export async function flashESP32WithCerts(
  port: any,
  firmware: { data: string; address: number }[],
  reportProgress: (
    idx: number,
    written: number,
    total: number,
    content?: string,
  ) => void,
  flashOptions: FlashOptions = defaultFlashOptions,
) {
  const baudrate = flashOptions.baudRate || 460800;
  const transport = new Transport(port as any, true);
  const terminal: IEspLoaderTerminal = {
    clean() {
      // console.clear();
    },
    writeLine(line: string) {
      // console.log(line);
    },
    write(chunk: string) {
      // console.log(chunk);
    },
  };

  const options: LoaderOptions = {
    transport,
    baudrate,
    romBaudrate: 115200,
    terminal,
  };

  const loader = new ESPLoader(options);
  console.log("📦 Uploading filesystem image with certificate files");
  // Start handshake
  const rom = await loader.main();
  reportProgress(-1, 0, 0, `Connected to ${rom}`);
  await loader.writeFlash({
    fileArray: firmware,
    ...flashOptions,
    compress: true,
    reportProgress: (idx, written, total) => {
      console.log(`Flashing segment #${idx}: ${written}/${total}\r`);
      reportProgress(idx, written, total);
    },
    // calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)),
  });

  try {
    await loader.after("hard_reset").catch(console.warn);
    await transport.disconnect();
  } catch (e) {
    console.warn("⚠️ Could not finalize flash session:", e);
  }
}
