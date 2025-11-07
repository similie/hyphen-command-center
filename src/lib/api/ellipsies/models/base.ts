import { UserApi } from "$lib/api/models";
import type { BaseModel } from "$lib/types";
import { Debounce } from "$lib/utils";
import { HttpMethod, type HTTPConnector } from "@similie/http-connector";
import {
  Model,
  QueryDecorators,
  type IEntity,
  type IQueryOrPartial,
} from "@similie/model-connect-entities";

export class HyphenModel<t extends IEntity> extends Model<t> {
  private readonly userApi: UserApi;
  private static maintainCounter: number = 0;
  private readonly maintainThreshold: number = 5; // e.g., every 5 calls
  private readonly debounce: Debounce = new Debounce();
  constructor(modelname: string) {
    super();
    this.modelname = modelname;
    this.userApi = new UserApi();
  }

  private runMaintainSession = this.debounce.bounce(
    async (self: HyphenModel<t>) => {
      try {
        const result = await self.userApi.maintainSession();
        if (!result.ok) {
          console.warn("Session could not be maintained.");
        }
      } catch (e) {
        console.error("Error maintaining session:", e);
      }
    },
    500,
  );

  private maintain() {
    // we do this because we want to make sure our requests
    // touch the api to maintain the session only every N calls
    if (HyphenModel.maintainCounter < this.maintainThreshold) {
      HyphenModel.maintainCounter += 1;
      return;
    }
    HyphenModel.maintainCounter = 0;
    this.runMaintainSession(this);
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
    this.maintain();
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
    this.maintain();
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

  public override find(query?: IQueryOrPartial<t>): QueryDecorators<t> {
    this.maintain();
    return super.find(query) as QueryDecorators<t>;
  }

  protected async connect<v = any>(
    thisUrl: string,
    method: HttpMethod = HttpMethod.GET,
    query: any = {},
    limiter: any = {},
  ): Promise<v> {
    this.maintain();
    const results = await this.connectRaw(thisUrl, method, query, limiter);
    if (!results.ok) {
      throw new Error(`Error fetching device statistics`);
    }
    return results.json();
  }
}
