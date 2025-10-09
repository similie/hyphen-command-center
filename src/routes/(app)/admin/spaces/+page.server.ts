import { SpacesQuery, UserQuery } from "$lib/server/db/query";
import { redirect } from "@sveltejs/kit";
export async function load(event) {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    return redirect(301, "/");
  }

  const limit = 30;
  const config = await event.locals.config();
  const sQuery = new SpacesQuery(config!);

  const spaces = await sQuery.all(undefined, undefined, undefined, 0, limit);
  return { ...spaces, limit };
}
