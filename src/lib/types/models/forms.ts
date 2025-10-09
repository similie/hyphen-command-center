import type { Component } from "svelte";
import type { BaseUIDModel, FormField, UUID } from "./base-model";
import type { UserRoles } from "./user";

export enum OnSubmitAction {
  LOCK = "lock",
  CLEAR = "clear",
  RETAIN = "retain",
}

export interface ApplicationSubmissionModel extends BaseUIDModel {
  values: Record<string, any>; // Submission values (e.g., essay, documents)
  token: string;
  application: UUID;
  user?: UUID;
  draft: boolean;
}

export type ApplicationSubmissionModelWithForm = {
  application_submission: ApplicationSubmissionModel;
  form_application: ApplicationModel;
};

export interface ApplicationTokenModel extends BaseUIDModel {
  token: string;
  application: UUID;
}

export interface ApplicationModel extends BaseUIDModel {
  forms: FormModel[] | UUID[]; // Submission values (e.g., essay, documents)
  active: boolean;
  role: UserRoles;
  name: string;
}

export interface FormModel extends BaseUIDModel {
  form: FormModelValue[]; // Submission values (e.g., essay, documents)
  active: boolean;
  role: UserRoles;
  name: string;
}

export interface FormModelValue
  extends Omit<
    FormField,
    "type" | "bindOn" | "validate" | "isDirty" | "template" | "hasError"
  > {
  // key: string; // Unique key for the form field
  type: FormTypeEnum;
  weight: number;
}

export enum FormTypeEnum {
  TEXT = "text",
  DATE = "date",
  NUMBER = "number",
  EMAIL = "email",
  TEXT_AREA = "textarea",
  RICH_TEXT = "rich_text",
  FILE_UPLOAD = "file_upload",
  RECORDS = "object",
  STRING_ARRAY = "array",
  CHECKBOX = "checkbox",
  CHECK_GROUP = "checkgroup",
  ROLE = "role",
  SELECT = "select",
  RADIO = "radio",
}

export type FormValueModel = {
  name: string;
  type: FormTypeEnum;
  icon: Component;
};

/**
 * export type FormField = {
   name: string;
   print?: string;
   label: string;
   type: string;
   value: any;
   required: boolean;
   max?: number;
   min?: number;
   pattern?: string;
   steps?: number;
   template?: Component<any>;
   props?: any;
   bindOn?: string[];
   selectOptions?: { name: string; value: number | string | undefined }[];
   validate?: (value: any) => boolean;
   placeholder?: string;
   errors?: Record<string, boolean>;
   isDirty?: boolean;
   hasError?: boolean;
 };
 
 */
