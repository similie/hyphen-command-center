import { UserRoles, type UserModel } from "$lib";
import { UserQuery, RegistrationQuery } from "$lib/server/db/query";
import { error, type RequestHandler } from "@sveltejs/kit";
export const POST: RequestHandler = async (event) => {
  try {
    const body = (await event.request.json()) as Partial<UserModel>;
    const search = {
      token: body.uid,
    };

    const rq = new RegistrationQuery();
    const session = await event.locals.auth();
    const unrestricted = await rq.restrictedAccess(
      session?.user || null,
      search,
    );
    if (!unrestricted) {
      throw error(401, "Unauthorized");
    }

    if (session?.user && session?.user.role !== UserRoles.ADMIN) {
      throw error(403, "Unauthorized");
    }

    const query = new UserQuery(session?.user);
    const remove = ["created_at", "updated_at", "active", "verified"];
    for (const key of remove) {
      if (body[key as keyof UserModel] !== undefined) {
        delete body[key as keyof UserModel];
      }
    }
    const user = await query.createOne(body, false);
    if (user) {
      await rq.update({ active: false }, { uid: user.uid });
    }
    const token = await UserQuery.buildUserToken(user);
    return query.setLoginCookie(user, true, token);
  } catch (e: any) {
    console.error(e);
    throw error(500, e.message);
  }
};
