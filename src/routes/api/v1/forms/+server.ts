import { type PutQueryModel, type FormModel } from "$lib/types";
import { FormQuery } from "$lib/server/db/query/form";
import { UserQuery } from "$lib/server/db/query/user";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    const url = new URL(event.request.url);
    const skip = url.searchParams.get("skip") || 0;
    const limit = url.searchParams.get("limit") || 0;
    const active = url.searchParams.get("active") || undefined;
    let isActive = true;
    if (active === "false") {
      isActive = false;
    }

    const query = new FormQuery();
    const results = await query.all(
      +skip,
      +limit,
      sessionUser?.role || 0,
      isActive,
    );
    return json(results);
  } catch (e: any) {
    console.error("Form all Error", e);
    throw error(500, e.message);
  }
};

export const PUT: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const body = (await event.request.json()) as PutQueryModel<FormModel>;

    const query = new FormQuery();
    const form = await query.update(body.values, body.where);
    return json(form);
  } catch (e: any) {
    console.error("Form Update Error", e);
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const body = (await event.request.json()) as Partial<FormModel>;
    const query = new FormQuery();
    const form = await query.destroy(body);
    return json(form);
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

    const body = (await event.request.json()) as Partial<FormModel>;
    const query = new FormQuery();
    const form = await query.createOne(body);
    if (!form) {
      throw error(400, "Failed to create form");
    }
    return json(form);
  } catch (e: any) {
    console.error("Form Creation Error", e.message);
    throw error(500, e.message);
  }
};
