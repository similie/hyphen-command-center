import { HttpConnection } from "./http-connection";

export class BaseApi extends HttpConnection {
  protected readonly baseUrl: string;
  constructor(baseUrl: string, appendJwt = false, cors = true) {
    super(cors, appendJwt);
    this.baseUrl = baseUrl;
  }

  protected removeTrailingSlash(url: string) {
    return url.replace(/\/$/, "");
  }

  private encodeParams(params: any, path?: string) {
    if (!params) {
      return "";
    }

    let setPath = ``;
    if (path?.includes("?")) {
      setPath = `&`;
    } else {
      setPath = "?";
    }

    return (
      setPath +
      Object.keys(params || {})
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
        )
        .join("&")
    );
  }

  protected urlSet(path: string, params?: Partial<any>) {
    return `${this.baseUrl}${
      this.baseUrl.endsWith("/") ? "" : "/"
    }${path}${this.encodeParams(params, path)}`;
  }
  protected parseData(data: any) {
    return { data: JSON.stringify(data) };
  }

  protected parseBody(body: any) {
    return { body: JSON.stringify(body) };
  }
}
