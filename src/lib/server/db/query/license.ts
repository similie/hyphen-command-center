import type { SiteConfig, LicenseAgreementModel } from "$lib/types";
import { desc } from "drizzle-orm";
import { LicenseAgreementTable } from "../schema";
import { ModelQuery } from "./model-query";

export class LicenseAgreementQuery extends ModelQuery<LicenseAgreementModel> {
  public constructor() {
    super(LicenseAgreementTable);
  }
  public async mostRecent(
    config: SiteConfig,
  ): Promise<LicenseAgreementModel | null> {
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
    return result.pop() || null;
  }
}
