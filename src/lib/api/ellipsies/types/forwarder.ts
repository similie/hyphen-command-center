import { type IEntity, type UUID } from "@similie/model-connect-entities";

export enum ParameterValueOwnerBy {
  USER = "user",
  SYSTEM = "system",
  APPLICATION = "application",
  INTEGRATION = "integration",
  DEVICE = "device",
}

export interface IParameters extends IEntity {
  name: string;
  description?: string;
  key: string;
  value: string;
  secret: boolean;
  iv?: string;
  owner?: UUID;
  ownedBy?: ParameterValueOwnerBy;
}

export interface IDecoder extends IEntity {
  name: string;
  description?: string;
  codec: string;
}

export enum ForwarderTargetKind {
  MQTT = "mqtt",
  HTTP = "http",
}

export type MsgCtx = {
  topic: string;
  message: Buffer | string | any;
  payload?: any; // e.g. decoded data
  _uid: string;
  device: any; // your Device type
  ts?: Date;
  keys?: Record<string, Record<string, string>>;
  artifacts?: Record<string, any>; // e.g. decoded data, maps, etc.
};

export enum ParameterToForwardValue {
  HEADERS = "headers",
  BODY = "body",
  TOPIC = "topic",
  QUERY = "query",
}

export type ForwarderDeliverables = {
  host?: string;
  topic?: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, string> | string;
  method?: string;
};

export type MqttTarget = {
  kind: ForwarderTargetKind.MQTT;
  topicTemplate: string; // e.g. "/Hy/Config/{context.device.identity}/time"
  qos?: 0 | 1 | 2;
  retain?: boolean;
  payloadTemplate?: string[] | UUID[]; // optional template to override final payload body
  deliverables?: ForwarderDeliverables;
};

export type HttpTarget = {
  kind: ForwarderTargetKind.HTTP;
  method: "POST" | "PUT" | "PATCH" | "GET";
  urlTemplate: string; // e.g. "https://api.example.com/v1/events/{context.device.identity}"
  headers?: string[] | UUID[]; // can contain {secrets.FOO} or {params.BAR}
  bodyTemplate?: string[] | UUID[]; // JSON string template
  timeoutMs?: number;
  deliverables?: ForwarderDeliverables; // list of deliverables to track attempts
};

export type ForwarderTarget = MqttTarget | HttpTarget;
export type ParameterToForwardDetails = {
  key: string;
  derived: boolean;
  value?: string;
};

export type MqttTargetTemplate = {
  kind: ForwarderTargetKind.MQTT;
  topicTemplate: string; // e.g. "/Hy/Config/{context.device.identity}/time"
  payloadTemplate?: ParameterToForwardDetails[]; // optional template to override final payload body
};

export type HttpTargetTemplate = {
  kind: ForwarderTargetKind.HTTP;
  method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE";
  urlTemplate: string; // e.g. "https://api.example.com/v1/events/{context.device.identity}"
  headers?: ParameterToForwardDetails[]; // can contain {secrets.FOO} or {params.BAR}
  bodyTemplate?: ParameterToForwardDetails[]; // JSON string template
};

export type ForwarderTargetTemplates = MqttTargetTemplate | HttpTargetTemplate;

export interface IForwarders extends IEntity {
  name: string;
  enabled: boolean;
  topicPattern: string;
  targets: ForwarderTarget[];
  owner?: UUID;
  ownedBy?: ParameterValueOwnerBy;
  order: number;
  template?: UUID;
  creator?: UUID;
  parameters?: Record<ParameterToForwardValue, Record<string, string>>; // e.g. { topic: "Hy/DLQ" }
}

export interface IForwarderTemplate extends IEntity {
  name: string;
  description?: string;
  enabled: boolean;
  topicPattern: string;
  condition?: string;
  decoderIds?: UUID[];
  mapIds?: UUID[];
  transformerIds?: UUID[];
  targets: ForwarderTargetTemplates[];
  retryPolicy?: { maxAttempts?: number; backoffMs?: number };
  owner?: UUID;
  avatar: UUID;
}
