import { type UUID } from "$lib";
import { UserQuery, FormApplicationQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";
export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const { uid, form } = event.params;
    const query = new FormApplicationQuery();
    const ap = await query.findOne({ uid });
    if (!ap) {
      throw error(404, "Application not found");
    }
    ap.forms = ap.forms.filter((f) => f !== (form as UUID)) as UUID[];
    const saved = await query.update({ forms: ap.forms }, { uid });
    if (!saved.length) {
      throw error(500, "Failed to update application");
    }
    return json(saved.pop());
  } catch (e: any) {
    console.error("Form Deletion Error", e.message);
    throw error(500, e.message);
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const { uid, form } = event.params;
    const query = new FormApplicationQuery();
    const ap = await query.findOne({ uid });
    if (!ap) {
      throw error(404, "Application not found");
    }
    (ap.forms as UUID[]).push(form as UUID);
    const saved = await query.update({ forms: ap.forms }, { uid });
    if (!saved.length) {
      throw error(500, "Failed to update application");
    }
    return json(saved.pop());
  } catch (e: any) {
    console.error("Form Creation Error", e.message);
    throw error(500, e.message);
  }
};
