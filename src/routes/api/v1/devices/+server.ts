import { type PutQueryModel, type FormModel, type UUID } from "$lib";
import { UserQuery, FormApplicationQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }
  return json([]);
};

export const PUT: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }

  return json({});
};

export const DELETE: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }
  return json({});
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    return json({});
  } catch (e: any) {
    console.error("Form Creation Error", e.message);
    throw error(500, e.message);
  }
};
