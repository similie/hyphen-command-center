import { UserQuery } from "$lib/server/db/query";
import { error, json, type RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async (event) => {
  const { cookies } = event;
  const sessionToken = cookies.get(UserQuery.SESSION_COOKIE);
  if (!sessionToken) {
    return json({ ok: false });
  }
  return json({ ok: true });
};
