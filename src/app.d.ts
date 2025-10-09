// See https://kit.svelte.dev/docs/types#app

import type {
  CourseRegistrationCart,
  Session,
  SiteConfig,
  UserConfig,
  UUID,
} from "$lib";
import type { SocketServer } from "$lib/server";

// for information about these interfaces
declare global {
  var ServerInstance: ViteDevServer | PreviewServer; // Add _httpServer to the globalThis type
  var socketServer: SocketServer;

  namespace App {
    interface Locals {
      auth: () => Promise<Session | null>; // Optional because the user might not be authenticated
      config: () => Promise<SiteConfig | null>;
      userConfig: (userId: UUID) => Promise<UserConfig>;
      publicPaths: (config: SiteConfig) => Promise<SiteRoutingModel[]>;
      // user: UserModel | null;
    }

    // interface Error {}
    // interface Locals {}
    interface PageData {
      session: {
        uid: UUID;
        user: UserModel | null;
      };
      config: SiteConfig;
      userConfig: UserConfig;
      publicPaths?: SiteRoutingModel[];
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
