import type { BaseUIDModel, UUID } from "./base-model";

export interface ProductsModel extends BaseUIDModel {
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  category: string;
  image: UUID;
  meta: Record<string, any>;
  service: boolean;
}

export type ProductsForCartModel = {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  // locked?: boolean;
};

export type ProductsSearchResults = {
  products: ProductsModel[];
  count: number;
};
