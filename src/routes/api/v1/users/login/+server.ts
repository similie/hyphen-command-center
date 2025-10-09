import { UserQuery, OtpQuery } from "$lib/server/db/query";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
  const { identifier, password } = await event.request.json();
  const uQuery = new UserQuery();
  try {
    const user = await uQuery.login({ identifier, password });
    const trusted = !!event.cookies.get(UserQuery.TRUSTED_BROWSER);
    let token: string | undefined;
    if (!trusted) {
      const reg = new OtpQuery();
      await reg.loginOtp(user);
    } else {
      token = await UserQuery.buildUserToken(user);
    }
    return uQuery.setLoginCookie(user, trusted, token);
  } catch (e: any) {
    console.error("Login error", e.message);
    throw error(500, e.message);
  }
};
