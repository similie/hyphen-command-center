import type { PageDesignerModel } from "$lib/types";
import { PageDesignModel } from "../schema";
import { ModelQuery } from "./model-query";

export class PageDesignerQuery extends ModelQuery<PageDesignerModel> {
  public constructor() {
    super(PageDesignModel);
  }
}
