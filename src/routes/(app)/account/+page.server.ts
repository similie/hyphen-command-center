import { LicenseAgreementQuery, SpacesQuery } from "$lib/server/db/query";
export async function load(event) {
  // Customize the path to your email components.
  const lq = new LicenseAgreementQuery();
  const sp = new SpacesQuery();
  try {
    const config = await event.locals.config();
    if (!config) {
      return {};
    }
    const licenseAgreement = await lq.mostRecent(config);

    return { licenseAgreement };
  } catch {
    return { error: "Could not load license agreement" };
  }
}
