import type { ProductsModel } from "$lib/types";
import { asc } from "drizzle-orm";
import { ProductsTable } from "../schema";
import { ModelQuery } from "./model-query";

export class ProductsQuery extends ModelQuery<ProductsModel> {
  public constructor() {
    super(ProductsTable);
  }

  public async all(search?: string, skip?: number, limit?: number) {
    const where: Partial<Record<keyof ProductsModel, any>> = {};
    if (search) {
      where.name = { ilike: search };
    }

    let select = this.select().where(this.where(where));

    if (limit) {
      select.limit(limit);
    }

    if (skip) {
      select.offset(skip);
    }

    select.orderBy(asc(ProductsTable.name));

    const products = await select;
    const count = await this.count(where);

    return { products, count };
  }
}
