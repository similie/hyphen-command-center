import type { UserValidityCheck } from "$lib";
import { UserQuery, RegistrationQuery } from "$lib/server/db/query";
import { SendJson } from "$lib/server";
import { error, type RequestHandler } from "@sveltejs/kit";
export const POST: RequestHandler = async (event) => {
  try {
    const body = (await event.request.json()) as UserValidityCheck;
    const headers = {
      token: event.request.headers.get("token"),
    };

    const rq = new RegistrationQuery();
    const session = await UserQuery.sessionUser(event);
    const unrestricted = await rq.restrictedAccess(session, headers);
    if (!unrestricted) {
      throw error(401, "Unauthorized");
    }

    const query = new UserQuery(session!);
    const valid = await query.valid(body);
    return SendJson(valid);
  } catch (e: any) {
    console.error(e);
    throw error(500, e.message);
  }
};
