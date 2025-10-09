import { FormApplicationSubmissionQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const query = new FormApplicationSubmissionQuery();
    const { sessionUser, application } = await query.verifyPermitted(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const { session } = event.params;
    const found = await query.findOne({ uid: session });
    if (found?.application !== application.uid) {
      throw error(403, "Forbidden");
    }

    if (found.user !== sessionUser.uid) {
      throw error(403, "Forbidden");
    }
    return json(found);
  } catch (e: any) {
    console.error("Form all Error", e);
    throw error(500, e.message);
  }
};
