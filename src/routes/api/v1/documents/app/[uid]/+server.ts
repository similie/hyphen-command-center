import type { UUID } from "$lib";
import {
  AppDocsQuery,
  RegistrationQuery,
  UserQuery,
} from "$lib/server/db/query";
import { error, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.sessionUser(event);
    const url = new URL(event.request.url);
    const size = url.searchParams.get("size") || "md";
    const token = url.searchParams.get("token");
    const headers = {
      token: (event.request.headers.get("token") || token) as UUID,
    };

    const { uid } = event.params;
    if (!uid) {
      throw error(400, "Missing UID");
    }

    const rq = new RegistrationQuery();
    const query = new AppDocsQuery();
    const [unrestricted, validRole] = await Promise.all([
      rq.restrictedAccess(sessionUser, headers),
      query.validRole(sessionUser, uid as UUID),
    ]);

    if (!unrestricted && !validRole) {
      throw error(401, "Unauthorized");
    }

    return query.pipeFile(uid as UUID, size);
  } catch (e: any) {
    console.error("Conversation Starter Error", e);
    throw error(500, e.message);
  }
};
