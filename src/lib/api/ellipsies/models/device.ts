import { type UUID } from "@similie/model-connect-entities";
import { profileExpireTime } from "$lib/stores/deviceProfiles";
import { HyphenModel } from "./base";
import {
  type DeviceContentItems,
  type DeviceStatistics,
  type IDevice,
  type IDeviceCertificate,
  type IDeviceConfig,
  type IDeviceProfile,
  type IDeviceRegistration,
  type IDeviceStream,
  type IHeartbeat,
  type ISourceRepository,
  type ISensorWithKey,
  HttpMethod,
} from "../types";

export class DeviceModel extends HyphenModel<IDevice> {
  constructor() {
    super("devices");
  }

  public async pullStatistics(): Promise<DeviceStatistics> {
    const thisUrl = this.formatUrl(`statistics`);
    console.log("Fetching device statistics from", thisUrl);
    const statics = await this.connect<DeviceStatistics>(thisUrl);
    return statics;
  }

  public async deviceDetails(device: IDevice): Promise<DeviceContentItems> {
    const thisUrl = this.formatUrl(`details/${device.identity}`);
    return this.connect<DeviceContentItems>(thisUrl);
  }

  public async removeSensor(
    model: IDevice,
    sensorKey: string,
  ): Promise<{ device: IDevice; sensor: ISensorWithKey }> {
    const thisUrl = this.formatUrl("sensor");
    return this.connect<{ device: IDevice; sensor: ISensorWithKey }>(
      thisUrl,
      HttpMethod.DELETE,
      { deviceId: model.id, sensorKey },
    );
  }

  public async addSensor(
    model: IDevice,
    identity: string,
  ): Promise<{ device: IDevice; sensor: ISensorWithKey }> {
    const thisUrl = this.formatUrl("sensor");
    return this.connect<{ device: IDevice; sensor: ISensorWithKey }>(
      thisUrl,
      HttpMethod.POST,
      { deviceId: model.id, identity },
    );
  }

  public async refreshSensors(model: IDevice): Promise<DeviceConfigModel> {
    const thisUrl = this.formatUrl("sensor");
    return this.connect<DeviceConfigModel>(thisUrl, HttpMethod.PUT, {
      deviceId: model.id,
    });
  }

  public async sensors(
    model: IDevice,
  ): Promise<{ device: IDevice; sensors: ISensorWithKey[] }> {
    const thisUrl = this.formatUrl(`sensor/${model.id}`);
    return this.connect<{ device: IDevice; sensors: ISensorWithKey[] }>(
      thisUrl,
    );
  }

  public override async toJson(model: IDevice): Promise<IDevice> {
    try {
      const stringified = JSON.stringify(model);
      model = JSON.parse(stringified);
      return model;
    } catch (error) {
      console.error("Error serializing device model:", error);
    }

    return model;
  }

  public static isOnline(lastTouched?: Date, timeInMinutes = 15): boolean {
    if (!lastTouched) return false;
    const now = new Date();
    const diff = now.getTime() - new Date(lastTouched).getTime();
    return diff < timeInMinutes * 60 * 1000; // 15 minutes
  }

  public static async isDeviceOnline(device: IDevice): Promise<boolean> {
    const expireTime = await profileExpireTime(device);
    return this.isOnline(device.lastTouched, expireTime);
  }

  public async invalidateCertificate(
    deviceId: string | UUID,
  ): Promise<IDevice | IDevice[]> {
    const thisUrl = this.formatUrl(`invalidate-certificate`);
    return this.connect<IDevice | IDevice[]>(thisUrl, HttpMethod.POST, {
      id: deviceId,
    });
  }

  public async buildArtifact(deviceId: string, buildId: string) {
    const thisUrl = this.formatUrl(`artifacts/${deviceId}/${buildId}`);
    const results = await this.connectRaw(thisUrl);
    const blob = await results.blob();
    return blob;
  }
  public async flashDeviceLocal(
    device: IDevice,
    config: Record<string, any>,
    cb: (data: string) => Promise<void>,
  ) {
    const thisUrl = this.formatUrl(`local-flash`);
    return await this.streamer(
      thisUrl,
      HttpMethod.POST,
      { device: device.id, config },
      cb,
    );
  }
}

export class DeviceConfigModel extends HyphenModel<IDeviceConfig> {
  constructor() {
    super("devicesconfig");
  }

  public async publish(topic: string, message: string = "") {
    const thisUrl = this.formatUrl(`publish`);
    const results = await this.connectRaw(thisUrl, HttpMethod.POST, {
      topic,
      message,
    });

    const values = results.ok ? await results.json() : null;
    if (!values) {
      throw new Error(`Error publishing to topic ${topic}`);
    }
    return values as { ok: boolean };
  }

  public static getConfigTopic(data: Partial<IDeviceConfig>) {
    return `devices/config/${data.identity}`;
  }

  public static getConfigTopicAction(data: Partial<IDeviceConfig>) {
    return `${this.getConfigTopic(data)}/${data.actionType}/${data.actionName}`;
  }
}

export class HeartbeatModel extends HyphenModel<IHeartbeat> {
  constructor() {
    super("heartbeats");
  }
}

export class DeviceRegistration extends HyphenModel<IDeviceRegistration> {
  constructor() {
    super("registrations");
  }
}

export class DeviceStream extends HyphenModel<IDeviceStream> {
  constructor() {
    super("streams");
  }
}

export class DeviceCertificate extends HyphenModel<IDeviceCertificate> {
  constructor() {
    super("certificates");
  }

  async downloadAsBlob(identity: string): Promise<Blob> {
    const thisUrl = this.formatUrl(`download/${identity}`);
    const results = await this.connectRaw(thisUrl);
    const blob = new Blob([await results.arrayBuffer()], {
      type: "application/zip",
    });
    return blob;
  }

  async download(identity: string) {
    const blob = await this.downloadAsBlob(identity);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${identity}-certificates.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

export class SourceRepository extends HyphenModel<ISourceRepository> {
  constructor() {
    super("repositories");
  }
}

export class DeviceProfile extends HyphenModel<IDeviceProfile> {
  constructor() {
    super("deviceprofiles");
  }
}
