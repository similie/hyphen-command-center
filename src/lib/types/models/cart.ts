import type { UUID, BaseUIDModel } from "./base-model";

export type CartItem = {
  sku: string; // or productId
  qty: number;
  price: number; // optional unit price snapshot
  meta?: Record<string, unknown>;
  session?: UUID | null; // e.g. course registration session
  locked?: boolean;
  //
  name: string;
  image: UUID;
};

export type CartSnapshot = {
  id: UUID;
  userId?: string | null;
  items: CartItem[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export enum PaymentType {
  CASH = "cash",
  INVOICE = "invoice",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  SCHOLARSHIP = "scholarship",
  BANK_TRANSFER = "bank_transfer",
}

export interface CartInvoice extends BaseUIDModel {
  user: UUID;
  paid: boolean;
  meta: Record<string, any>;
  items: CartItem[];
  paymentType: PaymentType;
  total: number;
  paidTotal: number;
  invoice: string;
  expired: boolean;
}
