import type { SocketMessage, SocketMessageCallback } from "$lib/types";
import { delay } from "$lib/utils";
import { io, type Socket } from "socket.io-client";

export class WebSocketClient {
  private _socket: Socket;
  private _connected: boolean = false;
  public constructor(url?: string) {
    if (url) {
      this._socket = io(url, { transports: ["websocket"] });
    } else {
      this._socket = io({ transports: ["websocket"] });
    }

    this.init(url);
  }

  private init(url?: string) {
    this._socket.on("connect", () => {
      console.log("Connected to socket", url || "");
      this._connected = true;
    });

    this._socket.on("disconnect", () => {
      this._connected = false;
      console.log("Disconnected from socket");
    });

    this._socket.on("connect_error", (error: any) => {
      console.error("Failed to connect to socket", url, error);
    });
  }

  public get io() {
    return io;
  }

  public get socket(): Socket {
    return this._socket;
  }

  public connect() {
    return this._socket.connect();
  }

  public async connected(attempts = 10): Promise<boolean> {
    if (this._connected) {
      return true;
    }

    for (let i = 0; i < 10; i++) {
      if (this._connected) {
        return true;
      }
      await delay(50);
    }

    if (this._connected) {
      return true;
    }

    if (attempts <= 0) {
      throw new Error("Failed to connect to the socket");
    }

    this.connect();
    attempts--;
    return await this.connected(attempts);
  }

  public async send(topic: string, payload: any) {
    await this.connected();
    return this.socket.emit(topic, payload);
  }

  public listen(topic: string, callback: SocketMessageCallback): void {
    this.socket.on(topic, callback);
  }

  public forget(topic: string, callback: SocketMessageCallback): void {
    this.socket.off(topic, callback);
  }

  public close() {
    if (!this._connected) {
      return;
    }
    return this._socket.close();
  }
}
