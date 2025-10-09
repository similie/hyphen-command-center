import {
  type PutQueryModel,
  type ApplicationSubmissionModel,
  errorMessageWithCode,
} from "$lib";
import {
  UserQuery,
  FormApplicationSubmissionQuery,
} from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const query = new FormApplicationSubmissionQuery();
    const { sessionUser, application } = await query.verifyPermitted(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const url = new URL(event.request.url);
    const skip = url.searchParams.get("skip") || 0;
    const limit = url.searchParams.get("limit") || 0;
    const results = await query.all(+skip, +limit, sessionUser, application);
    return json(results);
  } catch (e: any) {
    console.error("Form all Error", e);
    throw error(500, e.message);
  }
};

export const PUT: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const body =
      (await event.request.json()) as PutQueryModel<ApplicationSubmissionModel>;
    const query = new FormApplicationSubmissionQuery();
    const form = await query.update(body.values, body.where);
    return json(form);
  } catch (e: any) {
    console.error("For Update Error", e);
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const body =
      (await event.request.json()) as Partial<ApplicationSubmissionModel>;
    const query = new FormApplicationSubmissionQuery();
    const form = await query.destroy(body);
    return json(form);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const query = new FormApplicationSubmissionQuery();
    const { sessionUser, application } = await query.verifyPermitted(event);
    const values = (await event.request.json()) as Record<string, any>;

    const body: Partial<ApplicationSubmissionModel> = { values };
    body.user = sessionUser?.uid;
    body.token = await query.createToken(application);
    body.application = application.uid;
    if (!body.token) {
      throw error(400, "Failed to create token");
    }
    const form = await query.createOne(body);
    if (!form) {
      throw error(400, "Failed to create form");
    }
    return json(form);
  } catch (e: any) {
    console.error("Form Creation Error", e.message);
    const message = errorMessageWithCode(e.message);
    throw error(message.code, message.message);
  }
};
