import { CartInvoiceTable } from "../schema";
import { ModelQuery } from "./model-query";
import {
  PaymentType,
  type CartInvoice,
  type SiteConfig,
  type UserModel,
} from "$lib/types";

// import { SystemEmail } from "$lib/server/email";
import { JobsManager } from "$lib/server/cache";
import { isUUID } from "$lib/utils";
import { desc } from "drizzle-orm";
import type { UUID } from "crypto";

export class CartInvoiceQuery extends ModelQuery<CartInvoice> {
  constructor() {
    super(CartInvoiceTable);
  }

  public async sendInvoicePaidEmail(invoice: CartInvoice, user: UserModel) {
    if (!invoice.paid) {
      return null;
    }
    return JobsManager.sendEmail(user.email, {
      data: {
        invoice,
        user,
      },
      templateName: "invoice",
    });
  }

  public async applyUpdatedInvoicePartial(
    update: Partial<CartInvoice>,
    invoiceUID: UUID,
  ) {
    const updated = await this.update(update, { uid: invoiceUID });
    if (!updated || !updated.length) {
      throw new Error("Failed to update invoice");
    }
    return updated[0];
  }

  public updateInvoicePartial(props: {
    config: SiteConfig | null;
    invoice: CartInvoice;
    balance: number;
    user: UserModel;
    usedScholarships?: UUID[];
  }): Partial<CartInvoice> {
    const { config, invoice, balance, usedScholarships, user } = props;
    const multiple = config?.currencyDivisor || 100;
    const transformedBalance = balance / multiple;
    const remaining = invoice.total - transformedBalance;
    const meta = invoice.meta || {};
    const update: Partial<CartInvoice> = {
      paidTotal: remaining,
      meta: {
        paymentType: [...(meta.paymentType || []), PaymentType.SCHOLARSHIP],
        sentBy: [...(meta.sentBy || []), user.uid],
      },
    };
    if (!transformedBalance) {
      update.paid = true;
    }
    return update;
  }

  public async expireInvoice(invoiceUID: UUID) {
    if (!isUUID(invoiceUID)) {
      throw new Error("Invalid UUID");
    }
    const invoice = await this.expirationCheck(invoiceUID);
    if (!invoice) {
      return;
    }

    const values = await this.update({ expired: true }, { uid: invoiceUID });
    return values[0];
  }

  public async expirationCheck(invoiceUID: UUID) {
    if (!isUUID(invoiceUID)) {
      throw new Error("Invalid UUID");
    }
    const invoice = await this.findOne({ uid: invoiceUID });
    if (!invoice) {
      return null;
    }

    if (invoice.paid || invoice.expired || invoice.paidTotal > 0) {
      return null;
    }

    return invoice;
  }

  public async findForUser(user: UUID) {
    if (!isUUID(user)) {
      throw new Error("Invalid user ID");
    }

    const results = await this.select()
      .where(this.where({ user, expired: false }))
      .orderBy(desc(CartInvoiceTable.created_at));

    return results as CartInvoice[];
  }

  public getItemsTotal(invoice: Partial<CartInvoice>) {
    const items = invoice.items || [];
    let total = 0;
    for (const item of items) {
      const price = item.price || 0;
      const qty = item.qty || 1;
      total += price * 100 * qty;
    }

    return Math.round(total / 100);
  }

  public async sendEmail(invoice: CartInvoice, user: UserModel) {
    try {
      return await JobsManager.sendEmail(user.email, {
        data: {
          invoice,
          user,
        },
        templateName: "invoice",
      });
    } catch (e) {
      console.error("Failed to send cart email", e);
    }
  }
}
