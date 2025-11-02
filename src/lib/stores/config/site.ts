import type { SiteConfig } from "$lib/types";
import { writable } from "svelte/store";
export const siteConfig = writable<SiteConfig>({
  siteName: "Hyphen Command Center",
  key: "default_local",
  logos: {
    nav: "/favicon.png",
    // "https://flowbite.com/docs/images/logo.svg"
  },
  siteDescription:
    "Open-source IoT management platform for real-time telemetry, firmware builds, and secure MQTT device control.",
  defaultTheme: "dark",
  defaultLocale: "en",
  defaultLocaleName: "English",
  apiBaseUrl: "http://localhost:1612/api/v2/",
  id: -1,
  applicationApi: "http://localhost:5001/api/",
  created_at: new Date(),
  updated_at: new Date(),
  defaultRole: 2,
  publicSite: false,
  applicationURL: "http://localhost:5173/",
  twoFactorAuth: false,
});

export const siteConfigInstance = () => {
  return new Promise<SiteConfig>((resolve) => {
    siteConfig.subscribe(resolve);
  });
};
