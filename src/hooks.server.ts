import {
  CacheKeys,
  createCacheKey,
  EllipsiesConnector,
  type Session,
  type SiteConfig,
  type SiteRoutingModel,
  type UserConfig,
  type UUID,
} from "$lib";
import { UserQuery, ConfigQuery, SiteRoutingQuery } from "$lib/server/db/query";
import { parse } from "cookie";
import { RedisCache } from "$lib/server/cache";
import { JobsManager } from "$lib/server/cache/jobs";
import { bootstrap } from "$lib/server/db/bootstrap";
RedisCache.init().catch(console.error);
bootstrap().catch(console.error);

export async function handle({ event, resolve }) {
  const cookies = parse(event.request.headers.get("cookie") || "");
  event.locals.auth = async () => {
    const { cookies } = event;
    const sessionToken = cookies.get(UserQuery.SESSION_COOKIE);
    if (!sessionToken) {
      return null;
    }

    try {
      const uQuery = new UserQuery();
      const decoded = uQuery.decode(sessionToken);
      /**
       * If we have activity before the session expires then renew the session
       */
      if (uQuery.isTokenExpiring(decoded)) {
        uQuery.signAndSetCookies(event, decoded.user);
      }
      return decoded as Session;
    } catch (err) {
      console.error("Session token verification failed:", err);
      return null;
    }
  };
  const cQuery = new ConfigQuery();
  event.locals.config = async () => {
    const siteName = cookies.sitename || "Similie";
    try {
      const key = createCacheKey(CacheKeys.SITE_CONFIG, siteName);
      const cachedConfig = await RedisCache.get<SiteConfig>(key);
      if (cachedConfig) {
        JobsManager.start(cachedConfig);
        return cachedConfig;
      }
      const config = await cQuery.getSiteConfig(siteName);

      if (config) {
        await RedisCache.set(key, config);
        JobsManager.start(config);
      }
      return config;
    } catch (e: any) {
      console.error("Failed to get site config", e.message);
    }
    return null;
  };

  event.locals.userConfig = async (userId: UUID) => {
    const key = createCacheKey(CacheKeys.USER_CONFIG, userId);
    const userConfig = await RedisCache.get<UserConfig>(key);
    if (userConfig) {
      return userConfig;
    }
    const config = await cQuery.getUserConfig(userId);
    if (userConfig) {
      await RedisCache.set(key, userConfig);
    }
    return config;
  };
  const srQuery = new SiteRoutingQuery();
  event.locals.publicPaths = async (
    config: SiteConfig,
  ): Promise<SiteRoutingModel[]> => {
    try {
      const key = createCacheKey(CacheKeys.PUBLIC_ROUTES, config.id);
      const siteRoutingModels = await RedisCache.get<SiteRoutingModel[]>(key);
      if (siteRoutingModels) {
        return siteRoutingModels;
      }

      const publicRoutes =
        (await srQuery.publicRoutes(config)) || ([] as SiteRoutingModel[]);
      RedisCache.set(key, publicRoutes);
      return publicRoutes;
    } catch (e: any) {
      console.error("Failed to get site path values", e.message);
    }
    return [];
  };

  return await resolve(event);
}
