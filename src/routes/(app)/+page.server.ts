import { LicenseAgreementQuery, SpacesQuery } from "$lib/server/db/query";
export async function load(event) {
  // Customize the path to your email components.
  const config = await event.locals.config();
  const lq = new LicenseAgreementQuery();
  const sp = new SpacesQuery();
  const licenseAgreement = await lq.mostRecent(config!);
  const spaces = await sp.find({ weight: 9999 });
  return { licenseAgreement, spaces };
}
