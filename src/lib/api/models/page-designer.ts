import type { PageDesignerModel } from "$lib/types";
import { ApiModel } from "../base";

export class PageDesignerApi extends ApiModel<PageDesignerModel> {
  public constructor() {
    super("content");
  }
}
