import { HTTPConnector, HttpMethod } from "@similie/http-connector";
import {
  Model,
  type IEntity,
  type UUID,
} from "@similie/model-connect-entities";

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
export class ParametersModel extends Model<IParameters> {
  constructor() {
    super();
    this.modelname = "parameters";
  }
}

export interface IDecoder extends IEntity {
  name: string;
  description?: string;
  codec: string;
}
export class DecoderModel extends Model<IDecoder> {
  constructor() {
    super();
    this.modelname = "decoders";
  }

  async testDecoder(payload: {
    topic: string;
    message: string;
    payload: string;
    decoder: Partial<IDecoder>;
  }): Promise<{ results: any }> {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}test`;
    const results = await (this.connector as HTTPConnector).getRequestResults(
      payload,
      {},
      thisUrl,
      HttpMethod.POST,
    );
    if (!results.ok) {
      throw new Error("Failed to test decoder");
    }

    const values = await results.json();
    return values;
  }

  async nameCheck(name: string) {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}check`;
    const results = await (this.connector as HTTPConnector).getRequestResults(
      { name },
      {},
      thisUrl,
      HttpMethod.GET,
    );
    if (!results.ok) {
      throw new Error("Failed to check decoder name");
    }

    const values = await results.json();
    return values.ok;
  }
}

export interface IForwardMap extends IEntity {
  name: string;
  description?: string;
  values: Record<string, string>;
}
export class ForwardMapModel extends Model<IForwardMap> {
  constructor() {
    super();
    this.modelname = "forwardmaps";
  }
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
  // condition?: string;
  // decoderIds: UUID[];
  // mapIds: UUID[];
  // transformerIds: UUID[]; // list of Transformer ids
  targets: ForwarderTarget[];
  // retryPolicy?: { maxAttempts?: number; backoffMs?: number };
  owner?: UUID;
  ownedBy?: ParameterValueOwnerBy;
  order: number;
  template?: UUID;
  creator?: UUID;
  parameters?: Record<ParameterToForwardValue, Record<string, string>>; // e.g. { topic: "Hy/DLQ" }
}
export class ForwardersModel extends Model<IForwarders> {
  constructor() {
    super();
    this.modelname = "forwarders";
  }
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
export class ForwarderTemplatesModel extends Model<IForwarderTemplate> {
  constructor() {
    super();
    this.modelname = "forwardtemplates";
  }
}
