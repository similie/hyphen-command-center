import {
  type ProductsModel,
  type ProductsSearchResults,
  type UUID,
} from "$lib";
import { ApiModel } from "../base";
export class ProductsApi extends ApiModel<ProductsModel> {
  public constructor() {
    super("products");
  }

  public async findMany(uid: UUID[]): Promise<ProductsModel[]> {
    const results = await this.get(this.urlSet("?uid=" + uid.join(",")));
    return (await results.json()) as ProductsModel[];
  }

  public async all(
    search?: string,
    limit?: number,
    skip?: number,
  ): Promise<ProductsSearchResults> {
    const results = await this.get(
      this.urlSet(`${search ? `?search=${search}` : ""}`, {
        limit,
        skip,
      }),
    );

    const values = (await results.json()) as ProductsSearchResults;
    return values;
  }
}
