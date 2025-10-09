import type { BaseModel, UUID } from "./base-model";

export interface SiteConfig extends BaseModel {
  siteName: string;
  key: string;
  siteDescription: string;
  defaultTheme: string;
  defaultLocale: string;
  defaultLocaleName: string;
  apiBaseUrl: string;
  applicationApi: string;
  defaultRole: number;
  publicSite: boolean;
  logos: Record<string, string>;
  currencyDivisor?: number;
  currency: string;
  currencySymbol: string;
  application?: UUID;
  registrationProduct?: UUID;
  location?: string;
  coordinates?: Record<string, string>;
  googleMapsKey?: string;
  paymentTimeout: number;
}

export interface UserConfig extends BaseModel {
  userId: number;
  avatar: string;
  theme: string;
  locale: string;
  localeName: string;
}

export interface SystemConfig {
  site: SiteConfig;
  user: UserConfig;
}
