import { siteUrl } from "$lib/server";
import { SendJsonError, SendJson } from "$lib/server";
import { RegistrationQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { token } = await event.request.json();

  if (!token) {
    return SendJsonError(403, "Invalid registration");
  }
  const rq = new RegistrationQuery();
  const registration = await rq.findOne({ uid: token });

  if (!registration || !registration.active) {
    return SendJsonError(403, "Invalid registration");
  }

  try {
    const config = await event.locals.config();
    if (!config) {
      return SendJsonError(403, "Invalid system configuration");
    }
    const issued = await rq.issueValidation(
      registration,
      config,
      siteUrl(event),
    );
    if (!issued.sent) {
      return SendJsonError(
        500,
        issued.reason || "Failed to send validation email",
      );
    }
    return SendJson({ ok: true });
  } catch (e: any) {
    console.error("FAILED USER REGISTRATION", e);
    return SendJsonError(500, e.message);
  }
};
