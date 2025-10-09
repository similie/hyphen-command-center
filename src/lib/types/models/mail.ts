import type { BaseUIDModel } from "./base-model";

export interface Email extends BaseUIDModel {
  email: string;
  content: string;
  templateProps: Record<string, any>;
  sent: boolean;
  error: string;
  attachments?: Record<string, Buffer[]>;
}
