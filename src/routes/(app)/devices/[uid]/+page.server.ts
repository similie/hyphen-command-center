import { DeviceModel, type UUID } from "$lib";
import { UserQuery } from "$lib/server/db/query";
import { redirect } from "@sveltejs/kit";
export async function load(event) {
  const sessionUser = await UserQuery.sessionUser(event);
  if (!sessionUser) {
    throw redirect(
      302,
      "/login?routeTo=" + encodeURIComponent(event.url.pathname),
    );
  }
  const api = new DeviceModel();

  try {
    const device = await api.find({ id: event.params.uid as UUID }).fetchOne();
    const toJson = await api.toJson(device);
    return { device: toJson };
  } catch (error) {
    console.error("Error fetching device:", error);
    return { device: null };
  }
}
