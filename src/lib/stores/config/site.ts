import type { SiteConfig } from "$lib/types";
import { writable } from "svelte/store";
export const siteConfig = writable<SiteConfig>({
  siteName: "4Shadow",
  key: "default_local",
  logos: {
    nav: "/favicon.png",
    // "https://flowbite.com/docs/images/logo.svg"
  },
  siteDescription: "Point forecast and tile server for open data",
  defaultTheme: "light",
  defaultLocale: "en",
  defaultLocaleName: "English",
  apiBaseUrl: "http://localhost:3000/api/v1/",
  id: -1,
  applicationApi: "http://localhost:5001/api/",
  created_at: new Date(),
  updated_at: new Date(),
  defaultRole: 2,
  publicSite: false,
  currency: "USD",
  currencySymbol: "$",
  currencyDivisor: 100,
});

export const siteConfigInstance = () => {
  return new Promise<SiteConfig>((resolve) => {
    siteConfig.subscribe(resolve);
  });
};
