import type { Component } from "svelte";

// Define the form field type
export type SelectOptionValues = {
  name: string;
  value: number | string | undefined;
};
export type FormField = {
  name: string;
  print?: string;
  label: string;
  type: string;
  value: any;
  required: boolean;
  max?: number | string | Date;
  min?: number | string | Date;
  locale?: string;
  pattern?: string;
  steps?: number;
  template?: Component<any>;
  props?: any;
  bindOn?: string[];
  time?: boolean;
  selectOptions?: SelectOptionValues[];
  validate?: (value: any) => boolean;
  placeholder?: string;
  errors?: Record<string, boolean>;
  isDirty?: boolean;
  hasError?: boolean;
  multiple?: boolean;
  accept?: string;
};

// this ensures we can use it in the frontend
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export interface BaseModel {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface BaseUIDModel {
  uid: UUID; // TODO: needs to be UUID
  created_at: Date | number;
  updated_at: Date | number;
}
export type HeadingElement = { title: string; href?: string };
export type ModelTab = {
  model: any;
  schema: FormField[];
  headings: HeadingElement[];
  name: string;
  heading: string;
  active?: boolean;
};
export type ModelChangeType<t extends BaseModel | BaseUIDModel> = {
  action: ModelActions;
  model: t;
};

export enum ModelActions {
  CREATE,
  UPDATE,
  DELETE,
  DETACH,
  ATTACH,
  CLEAR,
}
