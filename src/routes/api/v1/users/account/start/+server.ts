import { isEmail, type Registration } from "$lib";
import { siteUrl } from "$lib/server";
import { SendJsonError, SendJson } from "$lib/server";
import { RegistrationQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { name, email } = (await event.request.json()) as Partial<Registration>;

  if (!name || !email || !isEmail(email)) {
    return SendJsonError(403, "Invalid registration");
  }
  const rq = new RegistrationQuery();
  const resend = await rq.hasOne(email);
  if (resend) {
    const message = "Registration already sent";
    if (resend === "__fail__") {
      return SendJsonError(403, message);
    }
    return SendJson({ ok: false, message, resend });
  }

  const hasBeenRegistered = await rq.alreadyRegistered(email);
  if (hasBeenRegistered) {
    return SendJsonError(403, "Email already registered");
  }
  const created = (await rq.generate({ name, email })) as Registration;
  try {
    const config = await event.locals.config();
    if (!config) {
      return SendJsonError(403, "Invalid system configuration");
    }
    const issued = await rq.issueValidation(created, config, siteUrl(event));
    if (!issued.sent) {
      created && (await rq.destroy({ uid: created.uid }));
      return SendJsonError(
        500,
        issued.reason || "Failed to send validation email",
      );
    }
    return SendJson({ ok: true });
  } catch (e: any) {
    console.error("FAILED USER REGISTRATION", e);
    created && (await rq.destroy({ uid: created.uid }));
    return SendJsonError(500, e.message);
  }
};
