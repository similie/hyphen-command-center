import { type PageDesignerModel, type PutQueryModel } from "$lib";

import { UserQuery, PageDesignerQuery } from "$lib/server/db/query";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const url = new URL(event.request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    throw error(400, "Missing key");
  }

  const pq = new PageDesignerQuery();
  const result = await pq.findOne({ tag: key });
  if (!result) {
    throw error(404, "Not found");
  }
  return json(result);
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const pq = new PageDesignerQuery();
    const body = (await event.request.json()) as Partial<PageDesignerModel>;

    const page = await pq.createOne(body);

    if (!page) {
      throw error(500, "Failed to create page");
    }
    return json(page);
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
    const pd = new PageDesignerQuery();
    const body =
      (await event.request.json()) as PutQueryModel<PageDesignerModel>;
    const page = await pd.update(body.values, body.where);
    if (!page) {
      throw error(500, "Failed to update space");
    }

    return json(page);
  } catch (e: any) {
    console.error("Failed to update page", e);
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const rq = new PageDesignerQuery();
    const body = (await event.request.json()) as Partial<PageDesignerModel>;
    const page = await rq.destroy(body);
    return json(page);
  } catch (e: any) {
    throw error(500, e.message);
  }
};
