import { UserQuery } from "$lib/server/db/query";
import { error, json, type RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async (event) => {
  try {
    // const cookies = parse(event.request.headers.get("cookie") || "");
    const { cookies } = event;
    const sessionToken = cookies.get(UserQuery.SESSION_COOKIE);
    if (!sessionToken) {
      return json({ ok: false });
    }

    const uQuery = new UserQuery();
    const decoded = uQuery.decode(sessionToken);
    /**
     * If we have no activity before the session expires then return false
     * so the user can be redirected to the login page
     */
    if (uQuery.isTokenExpiring(decoded, 30)) {
      UserQuery.logout(event);
      return json({ ok: false });
    }
    return json({ ok: true });
  } catch (e: any) {
    throw error(500, JSON.stringify({ error: e.message }));
  }
};
