import type { ProductsModel } from "$lib/types";
import { writable } from "svelte/store";

export const ProductsModels = writable<ProductsModel[]>([]);
