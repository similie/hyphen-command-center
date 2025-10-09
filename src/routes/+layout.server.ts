import {
  APPLICATION_ROUTING,
  type SiteRoutingModel,
  type UserConfig,
  type SiteConfig,
  type Session,
} from "$lib";
import { UserQuery } from "$lib/server/db/query";
import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { loadLinks } from "$components/sidebar/sidebarLinks";
import type { SidebarLink } from "$lib";
const links = (() => {
  const locals = loadLinks();
  const linkValues: Record<string, SidebarLink> = {};
  for (const link of locals.links) {
    linkValues[link.href] = link;
  }
  return linkValues;
})();

const unrestrictedPaths: RegExp[] = [
  /^\/error/,
  /^\/signin/,
  /^\/api\/v1\/users\/account/,
  /^\/api\/v1\/users\/login/,
  /^\/api\/v1\/users\/logout/,
  /^\/api\/v1\/users\/signup/,
  /^\/api\/v1\/users\/valid/,
  /^\/api\/v1\/users\/forgot-password/,
  /^\/api\/v1\/payments\/success/,
  /^\/api\/v1\/payments\/cancel/,
  /^\/api\/v1\/payments\/webhook/,
  /^\/api\/v1\/forms\/applications/,
  /^\/email-previews/,
  /^\/account/,
  /^\/documentation/,
  /^\/public/,
];

const findUnrestrictedPath = (
  path: string,
  publicPaths: SiteRoutingModel[] = [],
  method?: string,
) => {
  // Then, when converting publicPaths, force the output type to RegExp[]:
  const publicRegexes: RegExp[] = publicPaths
    .filter((p) => {
      return typeof p.method === "undefined" || p.method === method;
    })
    .map((p) =>
      p.path === "/"
        ? /^\/$/ // For the root/index page
        : new RegExp("^" + p.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );

  const allRegexes: RegExp[] = [...unrestrictedPaths, ...publicRegexes];
  return allRegexes.some((regex) => regex.test(path));
};

const fulfillPublicPaths = async (
  session: Session | null,
  config: SiteConfig | null,
  event: RequestEvent,
) => {
  let userConfig: UserConfig | undefined = undefined;
  if (session?.uid) {
    userConfig = await event.locals.userConfig(session.uid);
  }
  return { session, config, userConfig };
};

export const load = async (event: RequestEvent) => {
  const method = event.request.method;
  const path = event.url.pathname;
  const config = await event.locals.config();
  const routing = APPLICATION_ROUTING();
  if (!config) {
    return { config: null, session: null };
  }
  if (path === routing.USERS.tap) {
    return { config, session: null };
  }
  const session = await event.locals.auth();
  const publicPaths = await event.locals.publicPaths(config);
  const unrestricted = findUnrestrictedPath(path, publicPaths, method);
  if (unrestricted) {
    return await fulfillPublicPaths(session, config, event);
  }

  if (!session?.user) throw redirect(303, routing.USERS.signin);
  const trustedId = event.cookies.get(UserQuery.TRUSTED_BROWSER);
  if (!trustedId) {
    throw redirect(303, routing.ACCOUNTS.otp);
  }
  const validIdentity = await UserQuery.isValidUser(
    session?.user.uid,
    trustedId,
  );

  if (!validIdentity) {
    throw redirect(303, routing.USERS.signin);
  }
  // Check if the user is allowed to access the requested path
  const linkPath = links[path];
  if (linkPath && linkPath.role > session?.user.role) {
    throw redirect(303, routing.ERRORS[401]);
  }

  try {
    const userConfig = await event.locals.userConfig(session.uid);
    return {
      session,
      config,
      userConfig,
    };
  } catch (error) {
    console.error("Error loading userConfig and llmConfig", error);
    return { session, config };
  }
};
