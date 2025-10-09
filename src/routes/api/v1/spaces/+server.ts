import { type SpacesModel, type PutQueryModel, UserRoles } from "$lib";

import { UserQuery, SpacesQuery, SpaceTagQuery } from "$lib/server/db/query";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);
  const role = sessionUser?.role || UserRoles.UNRESTRICTED;
  const url = new URL(event.request.url);

  const skip = Number(url.searchParams.get("skip") || "0");
  const limit = Number(url.searchParams.get("limit") || "0");
  const search = url.searchParams.get("search") || undefined;
  const tagString = url.searchParams.get("tags") || undefined;
  let tags = undefined;

  if (tagString) {
    tags = tagString.split(",").map((tag) => tag.trim());
  }

  const config = await event.locals.config();
  if (!config) {
    throw error(500, "No config found");
  }
  const pq = new SpacesQuery(config);

  const spaces = await pq.all(tags, search, role, skip, limit);
  return json(spaces);
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
    const pq = new SpacesQuery(config);
    const rq = new SpaceTagQuery();
    const body = (await event.request.json()) as Partial<SpacesModel>;
    const tags = body.tags ? [...body.tags] : [];
    delete body.tags;
    const plan = await pq.createOne(body);

    if (!plan) {
      throw error(500, "Failed to create space");
    }
    if (tags.length > 0) {
      await rq.createManyReferences(tags, plan);
    }
    plan.tags = tags;
    return json(plan);
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
    const tq = new SpaceTagQuery();
    const rq = new SpacesQuery(config);
    const body = (await event.request.json()) as PutQueryModel<SpacesModel>;
    const tags = body.values.tags ? [...body.values.tags] : [];

    await tq.tagger(tags, body.where.uid);

    const route = await rq.updateOne(body.values, body.where);
    if (!route) {
      throw error(500, "Failed to update space");
    }
    route.tags = tags;
    return json(route);
  } catch (e: any) {
    console.error("Failed to update space", e);
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
    const rq = new SpacesQuery(config);
    const body = (await event.request.json()) as Partial<SpacesModel>;
    const route = await rq.destroy(body);
    return json(route);
  } catch (e: any) {
    throw error(500, e.message);
  }
};
