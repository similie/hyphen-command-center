import { UserQuery } from "$lib/server/db/query";
import { type RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async (event) => {
  const sessionToken = event.cookies.get(UserQuery.TRUSTED_BROWSER);
  if (sessionToken) {
    await UserQuery.invalidateBrowserToken(sessionToken);
  }

  UserQuery.logout(event);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      // "Set-Cookie": `${UserQuery.SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      "Content-Type": "application/json",
    },
  });
};
