import type { SiteConfig, SiteRoutingModel } from "$lib/types";
import { SiteRoutingTable } from "../schema/system";
import { ModelQuery } from "./model-query";

export class SiteRoutingQuery extends ModelQuery<SiteRoutingModel> {
  public constructor() {
    super(SiteRoutingTable);
  }
  public publicRoutes(config: SiteConfig) {
    return this.find({
      config: config.id,
      public: true,
      active: true,
    });
  }
}
