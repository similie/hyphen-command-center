import { HTTPConnector, HttpMethod } from "@similie/http-connector";
import {
  Model,
  type IEntity,
  type UUID,
} from "@similie/model-connect-entities";

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
}
export class DeviceModel extends Model<IDevice> {
  constructor() {
    super();
    this.modelname = "devices";
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
}

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

  async download(identity: string) {
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
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${identity}-certificates.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
