import type { SiteConfig, LicenseAgreementModel } from "$lib/types";
import { desc } from "drizzle-orm";
import { LicenseAgreementTable } from "../schema";
import { ModelQuery } from "./model-query";
import { RedisCache } from "$lib/server/cache";

export class LicenseAgreementQuery extends ModelQuery<LicenseAgreementModel> {
  public constructor() {
    super(LicenseAgreementTable);
  }
  public async mostRecent(
    config: SiteConfig,
  ): Promise<LicenseAgreementModel | null> {
    const key = `license_agreement:most_recent:${config.id}`;
    const cached = await RedisCache.get<LicenseAgreementModel>(key);
    if (cached) {
      return cached;
    }

    const result = (await this.db
      .select()
      .from(this.table)
      .where(
        this.where({
          config: config.id,
          active: true,
        }),
      )
      .orderBy(desc(this.table.created_at))
      .limit(1)) as LicenseAgreementModel[];
    const agreement = result.pop() || null;
    if (agreement) {
      await RedisCache.set(key, agreement, 3600); // Cache for 1 hour
    }

    return agreement;
  }
}
