import { type SpacesModel, type PutQueryModel } from "$lib";

import { UserQuery, SpaceTagQuery } from "$lib/server/db/query";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  //   const sessionUser = await UserQuery.sessionUser(event);
  try {
    const url = new URL(event.request.url);
    const skip = Number(url.searchParams.get("skip") || "0");
    const limit = Number(url.searchParams.get("limit") || "0");
    const search = url.searchParams.get("search") || undefined;
    const pq = new SpaceTagQuery();
    const results = await pq.search(search, skip, limit);
    return json(results);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const config = await event.locals.config();
    if (!config) {
      throw error(500, "No config found");
    }
    const pq = new SpaceTagQuery();
    const body = (await event.request.json()) as Partial<SpacesModel>;
    const tag = await pq.createOne(body);
    return json(tag);
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
    const rq = new SpaceTagQuery();
    const body = (await event.request.json()) as PutQueryModel<SpacesModel>;
    const route = await rq.update(body.values, body.where);
    return json(route);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const config = await event.locals.config();
    if (!config) {
      throw error(500, "No config found");
    }
    const rq = new SpaceTagQuery();
    const body = (await event.request.json()) as Partial<SpacesModel>;
    const route = await rq.destroy(body);
    return json(route);
  } catch (e: any) {
    throw error(500, e.message);
  }
};
