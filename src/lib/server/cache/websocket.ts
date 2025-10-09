import type { SocketMessage } from "$lib/types/api/socket";
import { Server, type Socket } from "socket.io";
import type { ViteDevServer } from "vite";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  createClient,
  type RedisClientOptions,
  type RedisClientType,
} from "redis";

export const getRedisConfig = () => {
  const redisConfig: RedisClientOptions = {
    url: process.env.REDIS_CONFIG_URL || "redis://localhost:6379",
  };
  return redisConfig;
};

export class SocketServer {
  private static _instance: SocketServer | undefined;
  private _io: Server | undefined;
  //   private readonly _subscriptions = new Map<string, Set<CallbackFunction>>();
  private readonly pubClient: RedisClientType<Record<string, never>>;
  private readonly subClient: RedisClientType<Record<string, never>>;

  private constructor(
    server: ViteDevServer,
    nameSpace = "command-center-webui",
  ) {
    if (!server.httpServer) {
      throw new Error("Server is not an HTTP server");
    }
    this.pubClient = createClient(getRedisConfig()) as RedisClientType<
      Record<string, never>
    >;

    this.subClient = this.pubClient.duplicate();

    this._io = new Server(server.httpServer, { cors: { origin: "*" } });
    this._io.adapter(
      createAdapter(this.pubClient, this.subClient, { key: `${nameSpace}#` }),
    );

    this._io.on("connection", (ws: Socket) => {
      ws.on("close", () => {});
      ws.onAny((topic: string, message: any) => {
        this.handleIncomingMessage(ws, topic, message);
      });
    });
  }

  public async disconnect() {
    console.log("Disconnecting WebSocket server...");
    //
    if (this._io) {
      await this._io.close(); // Disconnect all sockets
    }

    if (this.pubClient.isOpen) {
      console.log("Closing Redis pubClient...");
      await this.pubClient.quit();
    }
    if (this.subClient.isOpen) {
      console.log("Closing Redis subClient...");
      await this.subClient.quit();
    }
    console.log("WebSocket server disconnected");
    SocketServer._instance = undefined;
  }

  private async connectRedis(): Promise<void> {
    await this.pubClient.connect();
    await this.subClient.connect();
  }

  private delay(time = 50) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  public async connected(attempts = 10): Promise<boolean> {
    if (this.pubClient.isReady) {
      return true;
    }

    for (let i = 0; i < 10; i++) {
      if (this.pubClient.isReady) {
        return true;
      }
      await this.delay(50);
    }

    if (this.pubClient.isReady) {
      return true;
    }

    if (attempts <= 0) {
      throw new Error("Failed to connect to the socket");
    }

    await this.pubClient.connect();
    attempts--;
    return await this.connected(attempts);
  }

  public static async applyServer(
    server: ViteDevServer,
  ): Promise<SocketServer> {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new SocketServer(server);
    await this._instance.connectRedis();
    return this._instance;
  }

  public static get instance(): SocketServer {
    if (!this._instance) {
      throw new Error("SocketServer instance not initialized");
    }
    return this._instance;
  }

  private async handleIncomingMessage(
    ws: Socket,
    topic: string,
    message: SocketMessage,
  ): Promise<void> {
    // ws.emit(topic, message);
    // try {
    //   const { topic } = message;
    // } catch (error) {
    //   console.error(`Failed to process message from client ${ws.id}:`, error);
    // }
  }

  private async attemptReconnect() {
    if (!globalThis.ServerInstance) {
      return;
    }
    globalThis.socketServer = await SocketServer.applyServer(
      globalThis.ServerInstance,
    );
  }

  public async send(topic: string, data: any) {
    if (!this._io) {
      console.log("THIS IS JACKED", globalThis.ServerInstance);
      await this.attemptReconnect();
      if (!this._io) {
        throw new Error("SocketServer instance not initialized");
      }
    }
    const connected = await this.connected();
    if (!connected) {
      throw new Error("Failed to connect to the socket");
    }
    this._io.emit(topic, data);
  }

  public async sendToClient(
    clientId: string,
    message: SocketMessage,
  ): Promise<void> {
    if (!this._io) {
      throw new Error("IO not initialized");
    }

    const connected = await this.connected();
    if (!connected) {
      throw new Error("Failed to connect to the socket");
    }

    try {
      const client = this._io.to(clientId);
      if (!client) {
        return;
      }

      client.emit(message.topic, message.data);
    } catch (e) {
      console.error("Error sending message to client:", e);
    }
  }

  public async broadcast(message: SocketMessage): Promise<void> {
    // const messageString = JSON.stringify(message);
    try {
      return this.send(message.topic, message.data);
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  }
}
