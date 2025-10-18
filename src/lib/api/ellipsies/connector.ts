import { GlobalConnection } from "@similie/model-connect-entities";
import { HTTPConnector } from "@similie/http-connector";
import { AUTHENTICATION_TOKEN_COOKIE } from "../base";

export class EllipsiesConnector {
  private static _instance: EllipsiesConnector | undefined;
  private readonly connector: HTTPConnector;
  private constructor() {
    this.connector = new HTTPConnector(
      "http://localhost:1612/api/v2/",
      true,
      true,
      AUTHENTICATION_TOKEN_COOKIE,
    );
    GlobalConnection.startInstance(this.connector);
  }

  public static init() {
    if (!this._instance) {
      this._instance = new EllipsiesConnector();
    }
    return this._instance;
  }

  public set cookieValue(value: string) {
    (GlobalConnection.getInstance().connector as HTTPConnector).cookieValue =
      value;
  }
}
