import { SendRedirect } from "$lib/server";
import { APPLICATION_ROUTING } from "$lib";
import { RegistrationQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async (event) => {
  const { uid } = event.params;
  const routing = APPLICATION_ROUTING();

  if (!uid) {
    return SendRedirect(routing.ERRORS[400], { message: "Missing uid" });
  }

  const rq = new RegistrationQuery();
  const register = await rq.findOne({
    uid: uid,
  });
  if (!register) {
    return SendRedirect(routing.ERRORS[400], {
      message: "Missing Registration",
    });
  }

  if (!register.active) {
    return SendRedirect(routing.ERRORS[400], {
      message: "This registration is not active",
    });
  }

  if (!register.verified) {
    await rq.update({ verified: true }, { uid });
  }

  return SendRedirect(routing.ACCOUNTS.signup, {
    uid,
  });
};
