import { UserRoles, type UserModel, type UUID } from "$lib";
import { UserQuery } from "$lib/server/db/query";

import { error, type RequestHandler, json } from "@sveltejs/kit";
export const PATCH: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session) {
    throw error(401, "Unauthorized");
  }
  const { uid } = event.params;
  if (session.user.role < UserRoles.ADMIN && session.user.uid !== uid) {
    throw error(401, "Unauthorized");
  }

  try {
    const body = (await event.request.json()) as Partial<UserModel>;
    const query = new UserQuery(session.user);
    const results = await query.updateUser(body, { uid: uid as UUID });
    if (!results.length) {
      throw error(404, "User not found");
    }
    const [user] = results;
    // if this comes from a user manager, we don't want to return the password back as a session
    if (
      session.user.role >= UserRoles.USER_MANAGER &&
      session.user.uid !== uid
    ) {
      return json(user);
    }
    /**
     * We re-apply the JWT token to the user object to ensure that the user is still
     * authenticated and has the correct permissions
     */
    return query.sendResponseWithUpdatedUser(user);
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};
