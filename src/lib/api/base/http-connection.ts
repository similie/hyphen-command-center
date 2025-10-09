import fetch from "isomorphic-fetch";
import { HttpMethod } from "$lib/types/api";
export class HttpConnection {
  public readonly CorsHeader: Partial<RequestInit> = {
    mode: "cors",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  private _cors: boolean;
  public constructor(cors = true, private appendJwt = false) {
    this._cors = cors;
  }
  /**
   * @returns {boolean}
   */
  public get cors() {
    return this._cors;
  }
  /**
   * @param {boolean} cors
   */
  public set cors(cors) {
    this._cors = cors;
  }

  public get fetch() {
    return fetch;
  }

  private async sendResponseAsText(
    response: Response,
    cb: (chunk: string, done: boolean) => Promise<void>,
  ) {
    const results = await response.text();
    const asArray = results.split("\n").filter((r: string) => !!r);
    for (const obj of asArray) {
      await cb(obj, true);
    }
    return { length: results.length, chunks: results };
  }

  public async fetchStreamData(
    response: Response,
    cb: (chunk: string, done: boolean) => Promise<any>,
  ) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("ReadableStream not supported on this browser.");
    }
    if (!response.body.getReader) {
      return this.sendResponseAsText(response, cb);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let length = 0; // keep track of how much data we've received
    let chunks = ""; // hold the data chunks
    const run = true;
    while (run) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream complete");
        break;
      }
      length += value.length;
      const chunk = decoder.decode(value, { stream: true });
      chunks += chunk;
      await cb(chunk, done);
    }
    return { chunks, length };
  }

  /**
   * @name appendJWT
   * @description if the appendJwt is set to true, this will add the JWT to the request header
   * @param {Partial<HeadersInit>} headers
   * @returns {Partial<HeadersInit>}
   */
  private appendJWT(headers: Partial<HeadersInit>) {
    if (!this.appendJwt) {
      return;
    }
    const pullSession = pullCookieValueInBrowser(AUTHENTICATION_TOKEN_COOKIE);
    if (!pullSession) {
      return;
    }
    return Object.assign(headers, {
      Authorization: `Bearer ${pullSession}`,
    });
  }
  /**
   * @public
   * @name appendCorsToConfig
   * @description allows us to append the cors header to the
   *   request config
   * @param {RequestInit} config
   * @returns{RequestInit}
   */
  public appendCorsToConfig(config: RequestInit = {}): RequestInit {
    const configHeaders = config.headers || {
      "Content-Type": "application/json",
    };
    const corsHeaders = this.CorsHeader.headers;
    let sendHeaders: HeadersInit = { ...configHeaders };
    if (this.cors) {
      sendHeaders = {
        ...corsHeaders,
        ...sendHeaders,
      };
    }
    this.appendJWT(sendHeaders);
    const requestInit = {
      ...config,
      headers: sendHeaders,
    };

    if (this.cors) {
      requestInit.mode = this.CorsHeader.mode;
    }
    return requestInit;
  }
  /**
   * @public
   * @name send
   * @description a generic send for the an http request
   * @param {RequestInfo | URL} input
   * @param {RequestInit} init
   * @returns {Promise<Response>}
   */
  public send(input: RequestInfo | URL, init: RequestInit = {}) {
    const config = this.appendCorsToConfig(init);
    return fetch(input, config);
  }
  /**
   * @public
   * @name get
   * @description a generic send for the an http request
   * @param {RequestInfo | URL} input
   * @param {RequestInit?} init
   * @returns {Promise<Response>}
   */
  public get(input: RequestInfo | URL, init: RequestInit = {}) {
    init.method = HttpMethod.GET;
    return this.send(input, init);
  }
  /**
   * @public
   * @name delete
   * @description a generic send for the an http request
   * @param {RequestInfo | URL} input
   * @param {RequestInit?} init
   * @returns {Promise<Response>}
   */
  public delete(input: RequestInfo | URL, init: RequestInit = {}) {
    init.method = HttpMethod.DELETE;
    return this.send(input, init);
  }

  public patch(input: RequestInfo | URL, init: RequestInit = {}) {
    init.method = HttpMethod.PATCH;
    return this.send(input, init);
  }
  /**
   * @public
   * @name put
   * @description a generic send for the an http request
   * @param {RequestInfo | URL} input
   * @param {RequestInit?} init
   * @returns {Promise<Response>}
   */
  public put(input: RequestInfo | URL, init: RequestInit = {}) {
    init.method = HttpMethod.PUT;
    return this.send(input, init);
  }
  /**
   * @public
   * @name post
   * @description a generic send for the an http request
   * @param {RequestInfo | URL} input
   * @param {RequestInit?} init
   * @returns {Promise<Response>}
   */
  public post(input: RequestInfo | URL, init: RequestInit = {}) {
    init.method = HttpMethod.POST;
    return this.send(input, init);
  }
}

export interface IRawHttpQuery {
  url: string;
  http: HttpConnection;
}

export const pullCookieValueInBrowser = (key: string) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }
  // Add the equals sign to match the key precisely
  const nameEQ = key + "=";
  // Split the cookie string into individual key=value pairs
  const ca = document.cookie.split(";");
  // Loop through the array to find and return the right cookie value
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) {
      continue;
    }
    // Trim spaces that might be present around the cookie
    while (c.charAt(0) === " ") c = c.substring(1);
    // Check if the cookie string starts with the desired name
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length); // Extract and return the value
  }
  // If not found, return null
  return null;
};

export const AUTHENTICATION_TOKEN_COOKIE = "e_ses_val";
