import { HTTPConnector, HttpMethod } from "@similie/http-connector";
import {
  Model,
  type IEntity,
  type UUID,
} from "@similie/model-connect-entities";
import type { ISensor, SensorType } from "./sensor";

export interface IDevice extends IEntity {
  name: string;
  identity: string;
  owner?: UUID;
  assignedIdentity?: string;
  notes: string;
  meta: Record<string, any>;
  lat?: number;
  lng?: number;
  lastTouched?: Date;
  profile?: UUID;
}
export class DeviceModel extends Model<IDevice> {
  constructor() {
    super();
    this.modelname = "devices";
  }

  private formatUrl(path: string) {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}${path}`;
    return thisUrl;
  }

  public async removeSensor(
    model: IDevice,
    sensorKey: string,
  ): Promise<{ device: IDevice; sensor: ISensorWithKey }> {
    const thisUrl = this.formatUrl("sensor");
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { deviceId: model.id, sensorKey },
      {},
      thisUrl,
      HttpMethod.DELETE,
    );
    if (!results.ok) {
      throw new Error(`Error fetching sensors for device ${model.identity}`);
    }

    return results.json();
  }

  public async addSensor(
    model: IDevice,
    identity: string,
  ): Promise<{ device: IDevice; sensor: ISensorWithKey }> {
    const thisUrl = this.formatUrl("sensor");
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { deviceId: model.id, identity },
      {},
      thisUrl,
      HttpMethod.POST,
    );
    if (!results.ok) {
      throw new Error(`Error fetching sensors for device ${model.identity}`);
    }

    return results.json();
  }

  public async refreshSensors(model: IDevice): Promise<DeviceConfigModel> {
    const thisUrl = this.formatUrl("sensor");
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { deviceId: model.id },
      {},
      thisUrl,
      HttpMethod.PUT,
    );
    if (!results.ok) {
      throw new Error(`Error fetching sensors for device ${model.identity}`);
    }

    return results.json();
  }

  public async sensors(
    model: IDevice,
  ): Promise<{ device: IDevice; sensors: ISensorWithKey[] }> {
    const thisUrl = this.formatUrl(`sensor/${model.id}`);
    const results = await (this.connector as HTTPConnector).getRequestResults(
      {},
      {},
      thisUrl,
      HttpMethod.GET,
    );
    if (!results.ok) {
      throw new Error(`Error fetching sensors for device ${model.identity}`);
    }

    return results.json();
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

  public static isOnline(lastTouched?: Date): boolean {
    if (!lastTouched) return false;
    const now = new Date();
    const diff = now.getTime() - new Date(lastTouched).getTime();
    return diff < 15 * 60 * 1000; // 15 minutes
  }

  public async invalidateCertificate(
    deviceId: string | UUID,
  ): Promise<IDevice | IDevice[]> {
    const thisUrl = this.formatUrl(`invalidate-certificate`);
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { id: deviceId },
      {},
      thisUrl,
      HttpMethod.POST,
    );
    if (!results.ok) {
      throw new Error(`Error invalidating certificate for device ${deviceId}`);
    }
    return results.json();
  }

  public async buildArtifact(deviceId: string, buildId: string) {
    const thisUrl = this.formatUrl(`artifacts/${deviceId}/${buildId}`);
    const results = await (this.connector as HTTPConnector).getRequestResults(
      {},
      {},
      thisUrl,
      HttpMethod.GET,
    );
    const blob = await results.blob();
    return blob;
  }
  public async flashDeviceLocal(
    device: IDevice,
    config: Record<string, any>,
    cb: (data: string) => Promise<void>,
  ) {
    const thisUrl = this.formatUrl(`local-flash`);
    return await (this.connector as HTTPConnector).buildStreamQuery(
      { device: device.id, config },
      {},
      thisUrl,
      HttpMethod.POST,
      async (chunk: string) => {
        try {
          await cb(chunk);
        } catch {
          //
        }
      },
    );
  }
}

export enum DeviceConfigEnum {
  ERROR = -1,
  WAITING = 0,
  RESOLVED = 1,
  CANCELED = 2,
  EXPIRED = 3,
}

export enum DeviceConfigActionType {
  FUNCTION = "Function",
  VARIABLE = "Variable",
}

export interface IDeviceConfig extends IEntity {
  identity: string;
  state: DeviceConfigEnum;
  topic: string;
  data: string;
  value?: string;
  actionName: string;
  actionType: DeviceConfigActionType;
  user?: UUID;
  meta: Record<string, any>;
  noNullify: boolean;
}

export type ISensorWithKey = ISensor & { relation: { key: string } };

export class DeviceConfigModel extends Model<IDeviceConfig> {
  constructor() {
    super();
    this.modelname = "devicesconfig";
  }

  public async publish(topic: string, message: string = "") {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}publish`;
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { topic, message },
      {},
      thisUrl,
      HttpMethod.POST,
    );

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

export type DevicePayload = any;
export type IPv4 = `${number}.${number}.${number}.${number}`;

export type DevicePayloadMessage = {
  device: string;
  target: number;
  date: Date;
  payload: DevicePayload;
};

export interface IHeartbeat extends IEntity {
  device: string;
  date: Date | number;
  network?: {
    ssid: string;
    bssid: string;
    rssi: number;
    channel: number;
    encryp: number;
    l_ip: IPv4;
    g_ip: IPv4;
    mask: IPv4;
    dns1: IPv4;
    dns2: IPv4;
  };
  cell?: {
    IMEI: string;
    IMSI: string;
    l_ip: IPv4;
    op: string;
    prov: string;
    n_mode: number;
    sig_q: number;
    ccid: string;
    cell: string;
    modem: string;
    temp: number;
  };
  sys: { free: number; mem: number; up: string; v: string };
  pow: { bat: number; current: number; solar_v: number; v_cel: number };
}

export class HeartbeatModel extends Model<IHeartbeat> {
  constructor() {
    super();
    this.modelname = "heartbeats";
  }
}

export interface IDeviceRegistration extends IEntity {
  identity: string;
  functionCount: number;
  variableCount: number;
  functions: string[];
  variables: string[];
  meta: Record<string, any>;
}

export class DeviceRegistration extends Model<IDeviceRegistration> {
  constructor() {
    super();
    this.modelname = "registrations";
  }
}

export interface IDeviceStream extends IEntity {
  device: string;
  topic: string;
  payload: Buffer | { type: string; data: number[] };
}

export class DeviceStream extends Model<IDeviceStream> {
  constructor() {
    super();
    this.modelname = "streams";
  }
}

export interface IDeviceCertificate extends IEntity {
  identity: string;
  cert: string;
  key: string;
  ca: string;
}

export class DeviceCertificate extends Model<IDeviceCertificate> {
  constructor() {
    super();
    this.modelname = "certificates";
  }

  async downloadAsBlob(identity: string): Promise<Blob> {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}download/${identity}`;
    const results = await (this.connector as HTTPConnector).getRequestResults(
      {},
      {},
      thisUrl,
      HttpMethod.GET,
    );
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

export interface ISourceRepository extends IEntity {
  name: string;
  url: string;
  sshKey: string;
  branch: string;
  meta: Record<string, any>;
}

export class SourceRepository extends Model<ISourceRepository> {
  constructor() {
    super();
    this.modelname = "repositories";
  }
}

export interface IDeviceProfile extends IEntity {
  name: string;
  avatar: UUID;
  script: string;
  defConfigSchema: Record<string, any>;
  configSchema: Record<string, any>;
  partitions: { address: number; type: string }[];
  repository: UUID;
}

export class DeviceProfile extends Model<IDeviceProfile> {
  constructor() {
    super();
    this.modelname = "deviceprofiles";
  }
}
