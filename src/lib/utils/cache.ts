import type { UUID } from "$lib/types";

export enum CacheKeys {
  SITE_CONFIG = "siteConfig:",
  USER_CONFIG = "userConfig:",
  PUBLIC_ROUTES = "publicRoutes:",
  SESSION_VALIDATION = "sessionValidation:",
}

export const createCacheKey = (key: CacheKeys, id: string | number | UUID) => {
  return `${key}${id}`;
};
