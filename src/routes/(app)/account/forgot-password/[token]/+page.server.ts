import { SendRedirect } from "$lib/server";
import { APPLICATION_ROUTING } from "$lib";
import { UserQuery } from "$lib/server/db/query";
export async function load(event) {
  // Customize the path to your email components.
  const routing = APPLICATION_ROUTING();
  const { token } = event.params;
  if (!token) {
    return SendRedirect(routing.ERRORS[403]);
  }
  const vt = await UserQuery.findVerificationToken(token);
  if (!vt || !vt.valid) {
    return SendRedirect(routing.ERRORS[403]);
  }
  return { token: vt.token };
}
