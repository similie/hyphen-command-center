import { type SiteConfig } from "$lib";
import { ApiModel } from "../base";
export class SiteConfigApi extends ApiModel<SiteConfig> {
  public constructor() {
    super("config/site");
  }
}
