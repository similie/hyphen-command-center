import { UserQuery } from "$lib/server/db/query";
import { json } from "@sveltejs/kit";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  try {
    const body = await event.request.json();
    const query = new UserQuery();
    const results = await query.find(body);
    return json({ valid: !results.length });
  } catch (e: any) {
    console.error("Search Error", e);
    throw error(500, e.message);
  }
};

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const url = new URL(event.request.url);
    const skip = url.searchParams.get("skip") || 0;
    const limit = url.searchParams.get("limit") || 0;
    const active = url.searchParams.get("active") || true;
    const search = url.searchParams.get("search") || undefined;
    const role =
      typeof url.searchParams.get("role") !== "undefined"
        ? parseInt(url.searchParams.get("role") || "0")
        : "-1";
    const query = new UserQuery(sessionUser);
    const users = await query.all(
      +skip,
      +limit,
      Boolean(active),
      search,
      +role,
    );
    const count = await query.countAllSearchUsers(
      search,
      Boolean(active),
      +role,
    );
    return json({
      users,
      count,
    });
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};
