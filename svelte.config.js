import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import dotenv from "dotenv";

dotenv.config();
/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      // “de facto” standard headers to tell SvelteKit your true protocol & host
      protocol_header: "x-forwarded-proto",
      host_header: "x-forwarded-host",
    }),
    csrf: {
      checkOrigin: false,
      // trustedOrigins: []
    },
  },

  alias: {
    $components: "src/components",
    $layouts: "src/layouts",
    $lib: "src/lib",
    $emails: "src/emails",
  },
};

export default config;
