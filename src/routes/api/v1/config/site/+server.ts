import { createCacheKey } from "$lib";
import { CacheKeys } from "$lib";
import { type PutQueryModel, type SiteConfig } from "$lib";
import { RedisCache } from "$lib/server";
import { ConfigQuery, UserQuery } from "$lib/server/db/query";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async (event) => {
  const session = await UserQuery.isAdmin(event);
  if (!session) {
    throw error(401, "Unauthorized");
  }
  const body = (await event.request.json()) as PutQueryModel<SiteConfig>;

  const query = new ConfigQuery();
  const configs = await query.update(body.values, body.where);

  for (const config of configs) {
    const key = createCacheKey(CacheKeys.SITE_CONFIG, config.key);
    await RedisCache.set(key, config);
  }

  return json(configs);
};
