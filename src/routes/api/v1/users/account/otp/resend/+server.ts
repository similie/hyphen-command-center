import type { OTP } from "$lib";
import { SendJsonError, SendJson } from "$lib/server";
import { OtpQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session || !session.user) {
    return SendJsonError(403, "Invalid session");
  }
  const otpQuery = new OtpQuery();
  const otp = await otpQuery.findOne({
    userId: session.user.uid,
    active: true,
    created_at: OtpQuery.createdAtSearch(1),
  });

  if (otp) {
    return SendJson({ otp: false });
  }

  await otpQuery.invalidateAllOtpByUserIdentity(session.user.uid);
  const created = (await otpQuery.createOne({
    identifier: session.user.email,
    userId: session.user.uid,
  })) as OTP;
  try {
    const issued = await otpQuery.issueOTP(created);
    return SendJson(issued);
  } catch (e: any) {
    return SendJsonError(500, e.message);
  }
};
