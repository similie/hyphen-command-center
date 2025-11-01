import { HttpMethod } from "@similie/http-connector";
import type {
  IDecoder,
  IForwarders,
  IForwarderTemplate,
  IForwardMap,
  IParameters,
} from "../types";
import { HyphenModel } from "./base";
export class ParametersModel extends HyphenModel<IParameters> {
  constructor() {
    super("parameters");
  }
}

export class DecoderModel extends HyphenModel<IDecoder> {
  constructor() {
    super("decoders");
  }

  async testDecoder(payload: {
    topic: string;
    message: string;
    payload: string;
    decoder: Partial<IDecoder>;
  }): Promise<{ results: any }> {
    const thisUrl = this.formatUrl(`test`);
    return this.connect<{ results: any }>(thisUrl, HttpMethod.POST, payload);
  }

  async nameCheck(name: string) {
    const thisUrl = this.formatUrl(`check`);
    const results = await this.connectRaw(thisUrl, HttpMethod.GET, { name });
    if (!results.ok) {
      throw new Error("Failed to check decoder name");
    }

    const values = await results.json();
    return values.ok;
  }
}

export class ForwardMapModel extends HyphenModel<IForwardMap> {
  constructor() {
    super("forwardmaps");
  }
}

export class ForwardersModel extends HyphenModel<IForwarders> {
  constructor() {
    super("forwarders");
  }
}

export class ForwarderTemplatesModel extends HyphenModel<IForwarderTemplate> {
  constructor() {
    super("forwardtemplates");
  }
}
