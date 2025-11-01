import type { BaseModel } from "$lib/types";
import { HttpMethod, type HTTPConnector } from "@similie/http-connector";
import { Model, type IEntity } from "@similie/model-connect-entities";

export class HyphenModel<t extends IEntity> extends Model<t> {
  constructor(modelname: string) {
    super();
    this.modelname = modelname;
  }

  protected formatUrl(path: string) {
    const { url } = this.connector.raw(this.modelConfig);
    const thisUrl = `${url}${path}`;
    return thisUrl;
  }

  protected connectRaw(
    thisUrl: string,
    method: HttpMethod = HttpMethod.GET,
    query: any = {},
    limiter: any = {},
  ) {
    return (this.connector as HTTPConnector).getRequestResults(
      query,
      limiter,
      thisUrl,
      method,
    );
  }

  protected async streamer(
    thisUrl: string,
    method: HttpMethod = HttpMethod.GET,
    query: any = {},
    cb: (chunk: string) => Promise<void>,
    limiter: any = {},
  ) {
    return await (this.connector as HTTPConnector).buildStreamQuery(
      query,
      limiter,
      thisUrl,
      method,
      async (chunk: string) => {
        try {
          await cb(chunk);
        } catch {
          //
        }
      },
    );
  }

  protected async connect<v = any>(
    thisUrl: string,
    method: HttpMethod = HttpMethod.GET,
    query: any = {},
    limiter: any = {},
  ): Promise<v> {
    const results = await this.connectRaw(thisUrl, method, query, limiter);
    if (!results.ok) {
      throw new Error(`Error fetching device statistics`);
    }
    return results.json();
  }
}
