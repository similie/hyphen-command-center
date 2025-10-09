import { ProductsQuery, UserQuery } from "$lib/server/db/query";
import { ShoppingCart } from "$lib/server/utils";
import { json } from "@sveltejs/kit";

export const POST = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);
  const { sku } = event.params;
  const userId = sessionUser?.uid ?? null;
  const cart = await ShoppingCart.getOrCreate(event, userId);
  const body = await event.request.json();
  const { qty = 1, locked = false } = body;
  const pQuery = new ProductsQuery();
  const product = await pQuery.findOne({ sku });

  product &&
    (await cart.addItem({
      sku: product.sku,
      qty: qty,
      locked,
      price: product.price,
      name: product.name,
      image: product.image,
      course: false,
    }));

  return json(cart.items);
};

export const DELETE = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);
  const { sku } = event.params;
  const userId = sessionUser?.uid ?? null;
  const cart = await ShoppingCart.getOrCreate(event, userId);
  await cart.removeItem(sku);
  return json(cart.items);
};

export const GET = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);
  const userId = sessionUser?.uid ?? null;
  const cart = await ShoppingCart.getOrCreate(event, userId);
  return json(cart.items);
};
