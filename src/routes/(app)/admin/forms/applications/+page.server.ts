import { FormApplicationQuery, UserQuery } from "$lib/server/db/query";
import { error } from "@sveltejs/kit";
export async function load(event) {
  const sessionUser = await UserQuery.isAdmin(event);
  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }
  const sq = new FormApplicationQuery();
  const limit = 30;
  try {
    const forms = await sq.all(0, limit, sessionUser.role, true);
    return { ...forms, limit };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { forms: [], count: 0, limit };
  }
}
