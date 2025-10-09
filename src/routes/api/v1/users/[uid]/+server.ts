import { isUUID, UserRoles } from "$lib";
import { UserQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.sessionUser(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const { uid } = event.params;
    if (!uid || !isUUID(uid)) {
      throw error(400, "Invalid user");
    }
    const query = new UserQuery(sessionUser);
    const user = await query.findOne({ uid });
    if (!user) {
      throw error(400, "Invalid User");
    }
    if (
      user.uid !== sessionUser.uid &&
      sessionUser.role < UserRoles.USER_MANAGER
    ) {
      throw error(400, "Invalid User");
    }

    return json(user);
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};
