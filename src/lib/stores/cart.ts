import type {
  CartItem,
  CourseRegistrationCart,
  ProductsModel,
} from "$lib/types";
import { writable } from "svelte/store";

export const ShoppingCartItems = writable<CourseRegistrationCart | undefined>();

export const addProductToCart = (items: CartItem[], product: ProductsModel) => {
  ShoppingCartItems.update((current) => {
    const values = current
      ? { ...current }
      : { cart: [], courses: [], products: [] };
    values.cart = [...items];
    values.products = [...(values.products || []), product];
    return values;
  });
};

export const clearShoppingCart = () => {
  ShoppingCartItems.update(() => {
    return { cart: [], courses: [], products: [] };
  });
};
