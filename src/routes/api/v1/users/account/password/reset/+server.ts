import { isEmail } from "$lib";
import { SendJsonError, SendJson, siteUrl } from "$lib/server";
import { UserQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { identifier } = await event.request.json();
  if (!identifier) {
    return SendJsonError(403, "Invalid registration");
  }

  const query: { username?: string; email?: string; active: boolean } = {
    active: true,
  };
  if (isEmail(identifier)) {
    query.email = identifier;
  } else {
    query.username = identifier;
  }
  const uq = new UserQuery();

  try {
    const user = await uq.findOne(query);
    if (!user) {
      return SendJson({ ok: true });
    }

    const activeSession = await uq.hasActivePasswordSession(user);
    if (activeSession) {
      return SendJson({
        ok: false,
        message: "Password change session already active",
      });
    }
    const config = await event.locals.config();
    if (!config) {
      return SendJson({ ok: true });
    }
    await uq.resetPassword(user, config, siteUrl(event));
    return SendJson({ ok: true });
  } catch (e) {
    console.error("Error finding user", e);
    return SendJsonError(500, "Password Reset Error");
  }
};
