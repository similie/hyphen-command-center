import { UserQuery } from "$lib/server/db/query";
import { error } from "@sveltejs/kit";
export async function load(event) {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }
  // Customize the path to your email components.
  // const config = await event.locals.config();
  const uq = new UserQuery(sessionUser);
  const limit = 30;
  const users = await uq.all(0, limit);
  const count = await uq.count({ active: true });
  return { users, count, limit };
}
