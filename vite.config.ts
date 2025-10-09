import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";

import path from "path";
import svelteEmailTailwind from "svelte-email-tailwind/vite";
import { SocketServer } from "./src/lib/server/cache/websocket";

const runServer = async (server: ViteDevServer | PreviewServer) => {
  if (!server.httpServer) {
    return;
  }

  if (globalThis.socketServer) {
    await globalThis.socketServer.disconnect();
  }

  globalThis.ServerInstance = server; // Store the server globally
  try {
    globalThis.socketServer = await SocketServer.applyServer(
      globalThis.ServerInstance,
    );
  } catch (e) {
    console.error("Failed to allocate socket server", e);
  }
};

const webSocketServer = {
  name: "webSocketServer",
  configureServer(server: ViteDevServer) {
    return runServer(server);
  },
  configurePreviewServer(server: PreviewServer) {
    return runServer(server);
  },
};

// A function that wraps the plugin to patch substituteHead behavior
function patchedSvelteEmailTailwind(opts: any) {
  const plugin = svelteEmailTailwind(opts);
  // We expect plugin has a `transform` hook or similar; patch it
  const originalTransform = plugin.transform;
  plugin.transform = async function (code: string, id: string) {
    if (
      !id.includes(opts.pathToEmailFolder || "/src/lib/server/email/templates/")
    ) {
      if (originalTransform) {
        return originalTransform.call(this, code, id);
      } else {
        return { code };
      }
    }

    if (!originalTransform) {
      return { code };
    }

    const result = await originalTransform.call(
      this,
      code.replaceAll("$renderer", "$payload"),
      id,
    );
    if (result) {
      result.code = result.code.replaceAll("$payload", "$renderer");
    }
    // console.log("WHAT NOW", result?.code);
    return result;
  };

  return plugin;
}

export default defineConfig({
  plugins: [
    sveltekit(),
    webSocketServer,
    patchedSvelteEmailTailwind({
      // tailwindConfig: emailTwConfig,
      pathToEmailFolder: "src/lib/server/email/templates",
      //pathToEmailFolder: "/src/emails",
    }),

    tailwindcss(),
  ],
  define: {
    __PROD__: process.env.NODE_ENV === "production",
  },
  build: {
    rollupOptions: {
      external: ["@mapbox/node-pre-gyp", "aws-sdk", "mock-aws-s3", "nock"],
    },
  },
  optimizeDeps: {
    exclude: ["@mapbox/node-pre-gyp", "aws-sdk", "mock-aws-s3", "nock"],
  },
  ssr: {
    external: ["@mapbox/node-pre-gyp", "aws-sdk", "mock-aws-s3", "nock"],
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"), // Map $lib to the correct folder
      $components: path.resolve(__dirname, "./src/components"),
      $layouts: path.resolve(__dirname, "./src/layouts"),
      $emails: path.resolve(__dirname, "./src/emails"),
    },
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});
