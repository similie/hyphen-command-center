import type { ValidOTP } from "$lib";
import { SendJsonError, compareHash } from "$lib/server";
import { OtpQuery, UserQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { code } = await event.request.json();
  if (!code) {
    return SendJsonError(403, "Invalid OTP Provided");
  }

  const session = await event.locals.auth();
  if (!session || !session.user) {
    return SendJsonError(403, "Invalid session");
  }

  const uq = new UserQuery();
  const otpQuery = new OtpQuery();

  try {
    const otp = await otpQuery.findOne({
      userId: session.user.uid,
      active: true,
      created_at: OtpQuery.createdAtSearch(5),
    });
    if (!otp) {
      return SendJsonError(403, "Invalid OTP Provided");
    }

    const match = await compareHash(otp.otp, code);
    if (!match) {
      return SendJsonError(403, "Invalid OTP Provided");
    }
    await otpQuery.invalidateAllOtpByIdentity(otp.uid);

    const token = await UserQuery.buildUserToken(session.user);
    const send: ValidOTP = { otp: true, user: session.user.uid, token };
    return uq.setTrustedCookieResponse(send, token);
  } catch (error: any) {
    console.error("OPT VERIFICATION ERROR", error);
    return SendJsonError(500, error.message);
  }
};
