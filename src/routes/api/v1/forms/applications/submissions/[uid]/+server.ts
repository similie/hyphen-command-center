import { type UUID } from "$lib";
import {
  UserQuery,
  FormApplicationSubmissionQuery,
} from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    const { uid } = event.params;

    const query = new FormApplicationSubmissionQuery();

    const results = await query.findWithApplication(uid as UUID);

    if (UserQuery.isAdminUser(sessionUser)) {
      return json(results);
    }

    if (results && results.application_submission?.user !== sessionUser?.uid) {
      throw error(403, "Forbidden");
    } else if (!results) {
      return json({});
    }

    return json(results);
  } catch (e: any) {
    console.error("Form all Error", e);
    throw error(500, e.message);
  }
};
