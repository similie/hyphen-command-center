import { type UUID, isUUID } from "$lib";
import { UserQuery, FormApplicationQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.sessionUser(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const { uid } = event.params;
    if (!uid || !isUUID(uid)) {
      throw error(400, "Invalid UID");
    }
    const query = new FormApplicationQuery();
    const results = await query.findApp(uid as UUID);
    if (!results) {
      throw error(404, "Application not found");
    }
    if (results.role > sessionUser?.role) {
      throw error(403, "Insufficient permissions to access this application");
    }
    return json(results);
  } catch (e: any) {
    console.error("Form all Error", e);
    throw error(500, e.message);
  }
};
