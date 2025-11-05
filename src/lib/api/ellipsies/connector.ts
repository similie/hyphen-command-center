import { GlobalConnection } from "@similie/model-connect-entities";
import { HTTPConnector } from "@similie/http-connector";
import { AUTHENTICATION_TOKEN_COOKIE } from "../base";
import { PUBLIC_API_URL } from "$env/static/public";

export class EllipsiesConnector {
  private static _instance: EllipsiesConnector | undefined;
  private readonly connector: HTTPConnector;
  private constructor(
    private _url: string = PUBLIC_API_URL || "http://localhost:1612/api/v2/",
  ) {
    this.connector = new HTTPConnector(
      this._url,
      true,
      true,
      AUTHENTICATION_TOKEN_COOKIE,
    );
    GlobalConnection.startInstance(this.connector);
  }

  public get url(): string {
    return this._url;
  }

  public static start(url?: string) {
    if (!this._instance) {
      this._instance = new EllipsiesConnector(url);
    }
    return this._instance;
  }

  public static init() {
    if (!this._instance) {
      return this.start();
    }
    return this._instance;
  }

  public set cookieValue(value: string) {
    (GlobalConnection.getInstance().connector as HTTPConnector).cookieValue =
      value;
  }
}
