import { type ProductsModel, type PutQueryModel, UserRoles } from "$lib";

import { UserQuery, ProductsQuery } from "$lib/server/db/query";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  // const sessionUser = await UserQuery.sessionUser(event);
  // if (!sessionUser) {
  //   throw error(401, "Unauthorized");
  // }
  const url = new URL(event.request.url);
  const pq = new ProductsQuery();
  const uid = url.searchParams.get("uid") || undefined;
  if (uid) {
    const uids = uid.split(",");
    const products = await pq.find({ uid: uids });
    return json(products);
  }

  const skip = Number(url.searchParams.get("skip") || "0");
  const limit = Number(url.searchParams.get("limit") || "0");
  const search = url.searchParams.get("search") || undefined;

  const products = await pq.all(search, skip, limit);
  return json(products);
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const pq = new ProductsQuery();

    const body = (await event.request.json()) as Partial<ProductsModel>;
    const product = await pq.createOne(body);

    if (!product) {
      throw error(500, "Failed to create product");
    }

    return json(product);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const PUT: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const config = await event.locals.config();
    if (!config) {
      throw error(500, "No config found");
    }
    const pq = new ProductsQuery();
    const body = (await event.request.json()) as PutQueryModel<ProductsModel>;
    const product = await pq.update(body.values, body.where);
    if (!product) {
      throw error(500, "Failed to update product");
    }
    return json(product);
  } catch (e: any) {
    console.error("Failed to update product", e);
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const pq = new ProductsQuery();
    const body = (await event.request.json()) as Partial<ProductsModel>;
    const product = await pq.destroy(body);
    return json(product);
  } catch (e: any) {
    console.error("Failed to delete product", e);
    throw error(500, e.message);
  }
};
