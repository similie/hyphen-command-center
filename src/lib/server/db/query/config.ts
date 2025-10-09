import { and, eq } from "drizzle-orm";
import { ConfigTable, UserConfigTable } from "../schema";
import { ModelQuery } from "./model-query";
import type { SiteConfig, SystemConfig, UserConfig, UUID } from "$lib/types";

export class ConfigQuery extends ModelQuery<SiteConfig> {
  constructor() {
    super(ConfigTable);
  }

  public async getUserConfig(userId: UUID): Promise<UserConfig> {
    const userConfig = await this.db
      .select()
      .from(UserConfigTable)
      .where(eq(UserConfigTable.userId, userId));
    return userConfig.pop() as unknown as UserConfig;
  }

  public async getSystemConfig(
    userId: UUID,
    key = "default",
  ): Promise<SystemConfig> {
    const site = await this.getSiteConfig(key);
    const user = await this.getUserConfig(userId);
    return {
      site,
      user,
    };
  }

  public async getSiteConfig(key = "default"): Promise<SiteConfig> {
    const results = await this.select().where(and(eq(ConfigTable.key, key)));
    const site = results.pop();
    if (!site) {
      throw new Error("No default config found");
    }
    return site as SiteConfig;
  }
}
