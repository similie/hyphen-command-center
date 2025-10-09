import { type ApplicationSubmissionModel, errorMessageWithCode } from "$lib";
import { FormApplicationSubmissionQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";
export const POST: RequestHandler = async (event) => {
  try {
    const query = new FormApplicationSubmissionQuery();
    const { sessionUser, application } = await query.verifyPermitted(event);
    const body: Partial<ApplicationSubmissionModel> = {};
    body.user = sessionUser?.uid;
    body.application = application.uid;
    body.draft = true;
    body.token = await query.createToken(application);
    if (!body.token) {
      throw error(400, "Failed to create token");
    }
    const form = await query.createOne(body);
    if (!form) {
      throw error(400, "Failed to create form");
    }
    return json(form);
  } catch (e: any) {
    console.error("Form Start Error", e.message);
    const message = errorMessageWithCode(e.message);
    throw error(message.code, message.message);
  }
};
