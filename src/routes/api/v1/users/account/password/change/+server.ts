import { VerificationContext } from "$lib";
import { SendJsonError, SendJson, minutesElapse } from "$lib/server";
import { UserQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { token, password } = await event.request.json();

  if (!token) {
    return SendJsonError(400, "Invalid Request");
  }
  const ut = await UserQuery.findVerificationToken(token);
  if (!ut || !ut.valid) {
    return SendJsonError(400, "Invalid Request");
  }

  if (ut.context !== VerificationContext.RESET_PASSWORD) {
    return SendJsonError(400, "Invalid Request");
  }

  if (minutesElapse(new Date(ut.created_at), 15)) {
    return SendJson({ ok: false, message: "Request Token expired" });
  }

  try {
    const uq = new UserQuery();
    const user = await uq.findOne({ uid: ut.userId });
    if (!user) {
      return SendJsonError(400, "Invalid User");
    }
    await UserQuery.invalidateBrowserToken(token);
    const changed = await uq.updatePassword(password, user.uid);
    if (!changed) {
      return SendJsonError(500, "Password Reset Failed");
    }
    return SendJson({ ok: true });
  } catch (e) {
    console.error("Error finding user", e);
    return SendJsonError(500, "Password Reset Error");
  }
};
