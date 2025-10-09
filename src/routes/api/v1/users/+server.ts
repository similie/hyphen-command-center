import { type UserModel, type PutQueryModel } from "$lib";
import { SystemEmail } from "$lib/server";
import { UserQuery } from "$lib/server/db/query";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const url = new URL(event.request.url);
    const skip = url.searchParams.get("skip") || 0;
    const limit = url.searchParams.get("limit") || 0;
    const active = url.searchParams.get("active") || true;
    const query = new UserQuery(sessionUser);
    const users = await query.all(+skip, +limit, Boolean(active));
    return json(users);
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};

export const PUT: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.sessionUser(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }
    const body = (await event.request.json()) as PutQueryModel<UserModel>;

    const query = new UserQuery(sessionUser);
    const users = await query.updateUser(body.values, body.where);

    for (const user of users) {
      // if we are updating the profile, we should
      // save the cookie
      if (user.uid !== sessionUser.uid) {
        continue;
      }
      query.signAndSetCookies(event, user);
      break;
    }

    return json(users);
  } catch (e: any) {
    console.error("Conversation Error", e);
    throw error(500, e.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const body = (await event.request.json()) as Partial<UserModel>;
    const query = new UserQuery(sessionUser);
    const users = await query.destroy(body);
    return json(users);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.isAdmin(event);
    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const body = (await event.request.json()) as Partial<UserModel>;
    const query = new UserQuery(sessionUser);
    const user = await query.insertUser(body);
    if (user) {
      const config = await event.locals.config();
      SystemEmail.send(user.email, {
        templateName: "account",
        data: { user: body, config },
      });
    }
    return json(user);
  } catch (e: any) {
    throw error(500, e.message);
  }
};
