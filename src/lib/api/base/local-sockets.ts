import type { UUID } from "$lib";
import { WebSocketClient } from "./sockets";

export const conversationStreamEvent = (conversation: UUID) => {
  return `conversation/${conversation}/stream`;
};

export const conversationStreamResponse = (conversation: UUID) => {
  return `conversation/${conversation}/response`;
};

export class LocalSocket extends WebSocketClient {
  private static _instance: LocalSocket;
  private constructor() {
    super();
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new LocalSocket();
    }
    return this._instance;
  }
}
