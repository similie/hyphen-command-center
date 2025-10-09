import { SendRedirect } from "$lib/server";
import { APPLICATION_ROUTING } from "$lib";
import { RegistrationQuery } from "$lib/server/db/query";
export async function load(event) {
  // Customize the path to your email components.
  const routing = APPLICATION_ROUTING();
  const uid = event.url.searchParams.get("uid");
  if (!uid) {
    return SendRedirect(routing.ERRORS[403]);
  }
  const rq = new RegistrationQuery();
  const register = await rq.findOne({
    uid: uid,
  });

  if (!register || !register.active || !register.verified) {
    return SendRedirect(routing.ERRORS[400]);
  }

  return { register };
}
