import {
  DonationQuery,
  UserQuery,
  CartInvoiceQuery,
  StudentScholarshipQuery,
} from "$lib/server/db/query";
import { error, redirect } from "@sveltejs/kit";
export async function load(event) {
  const sessionUser = await UserQuery.sessionUser(event);
  if (!sessionUser) {
    throw redirect(301, "/signin");
  }

  const { uid } = event.params;

  if (!uid) {
    throw error(400, "User ID is required");
  }
  // Customize the path to your email components.
  // const config = await event.locals.config();
  const uq = new UserQuery(sessionUser);
  const dq = new DonationQuery();
  const cq = new CartInvoiceQuery();
  const sq = new StudentScholarshipQuery();

  const user = await uq.findOne({ uid });
  if (!user) {
    throw error(404, "User not found");
  }

  if (!UserQuery.isAdminUser(sessionUser) && sessionUser.uid !== user.uid) {
    throw error(403, "Forbidden");
  }

  try {
    const donations = await dq.getTotalDonations(user.uid);
    const donationTypeCounts = await dq.getTotalDonationsByType(user.uid);
    const invoices = await cq.findForUser(user.uid);
    const scholarships = await sq.findAvailableFundsForStudent(user.uid);
    return { user, donations, donationTypeCounts, invoices, scholarships };
  } catch (error) {
    console.error("Error fetching donations:", error);
    return { user, donations: 0, invoices: [], scholarships: [] };
  }
}
