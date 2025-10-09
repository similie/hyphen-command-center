import type { BaseUIDModel, UUID } from "./base-model";

export interface OTP extends BaseUIDModel {
  userId: string;
  otp: string;
  active: boolean;
  identifier: string;
}

export interface VerificationToken extends BaseUIDModel {
  token?: string;
  userId: string;
  valid: boolean;
  context?: string;
}

export type ValidOTP = { otp: boolean; user: UUID; token: string };

export enum VerificationContext {
  RESET_PASSWORD = "password",
  AUTHENTICATION = "auth",
}
