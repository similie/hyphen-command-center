import { UserRoles, type UUID } from "$lib";
import { UserQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";
export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session) {
    throw error(401, "Unauthorized");
  }
  const { uid } = event.params;
  if (session.user.role < UserRoles.USER_MANAGER && session.user.uid !== uid) {
    throw error(401, "Unauthorized");
  }
  try {
    const body = (await event.request.json()) as { password: string };
    const query = new UserQuery(session.user);
    const results = await query.validPassword(body.password, uid as UUID);
    return json(results);
  } catch (e: any) {
    console.error("Password Check Error", e);
    return json({ valid: false });
  }
};
