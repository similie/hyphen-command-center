import { type IEntity, type UUID } from "@similie/model-connect-entities";
import type { ISensorWithKey } from "./sensor";
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

export type WeekStreamCount = {
  week_start_date: string;
  week_label: string;
  date: string;
  weekday_name: string;
  stream_count: number;
};

export type DeviceTypeCount = {
  profile_id: string;
  profile_name: string;
  device_count: number;
};

export interface DeviceStatistics {
  totalDevices: number;
  offlineDevices: number;
  onlineDevices: number;
  deviceTypeCount: DeviceTypeCount[];
  deviceWeeklyCounts: WeekStreamCount[];
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
export interface IDeviceRegistration extends IEntity {
  identity: string;
  functionCount: number;
  variableCount: number;
  functions: string[];
  variables: string[];
  meta: Record<string, any>;
}

export interface IDeviceStream extends IEntity {
  device: string;
  topic: string;
  payload: Buffer | { type: string; data: number[] };
}

export interface IDeviceCertificate extends IEntity {
  identity: string;
  cert: string;
  key: string;
  ca: string;
}

export interface ISourceRepository extends IEntity {
  name: string;
  url: string;
  sshKey: string;
  branch: string;
  containerName: string;
  buildPath: string;
  meta: Record<string, any>;
}
export interface IDeviceProfile extends IEntity {
  name: string;
  avatar: UUID;
  script: string;
  offline: number;
  defConfigSchema: Record<string, any>;
  configSchema: Record<string, any>;
  partitions: { address: number; type: string }[];
  repository: UUID;
}

export type DeviceContentItems = {
  heartbeat: IHeartbeat;
  device: IDevice;
  deviceType: IDeviceProfile;
  sensors: ISensorWithKey[];
};

export interface IForwardMap extends IEntity {
  name: string;
  description?: string;
  values: Record<string, string>;
}
