import type { UUID } from "../models";

export interface SocketMessage<T = any> {
  _uid: UUID;
  topic: string;
  data: T;
  targetClientId?: string; // Optional: specifies the recipient client ID
}
export type CallbackFunction = (message: SocketMessage) => void;

export type SocketMessageResponse = SocketMessage;
export type SocketMessageCallback<T> = (message: SocketMessage<T>) => void;

export type SocketEventHandler<T> = (data: T) => void;

export type FireHoseEvent = { topic: string; message: string };

// Define message types for your WebSocket communication
export type WebSocketMessage =
  | { type: "progress"; message: string }
  | { type: "custom-event"; payload: any }
  | { type: "error"; error: string };

// Define a map of event types to their handlers
export type WebSocketEventMap = {
  progress: { message: string };
  "custom-event": { payload: any };
  error: { error: string };
};
