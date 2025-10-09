import { createCacheKey } from "$lib";
import { CacheKeys } from "$lib";
import { type PutQueryModel, UserRoles, type SiteConfig } from "$lib";
import { SendJson, RedisCache } from "$lib/server";
import { ConfigQuery } from "$lib/server/db/query";
import { error, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async (event) => {
  try {
    const session = await event.locals.auth();
    if (!session) {
      throw error(401, "Unauthorized");
    }
    const body = (await event.request.json()) as PutQueryModel<SiteConfig>;

    if (session.user.role < UserRoles.ADMIN) {
      throw error(401, "Unauthorized");
    }
    const query = new ConfigQuery();
    const configs = await query.update(body.values, body.where);

    for (const config of configs) {
      const key = createCacheKey(CacheKeys.SITE_CONFIG, config.key);
      await RedisCache.set(key, config);
    }

    return SendJson(configs);
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};
