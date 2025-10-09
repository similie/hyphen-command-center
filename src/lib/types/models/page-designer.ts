import type { BaseUIDModel } from "./base-model";

export enum PageDesignerContentType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  HTML = "html",
}

export type PageDesignerContentTypeValues = {
  value: string;
  meta?: any; // such as width-height
  alt?: string; // for image alt text
  heading?: string;
};

export type PageDesignerContent = {
  type: PageDesignerContentType;
  content: PageDesignerContentTypeValues;
};

export type PageDesignerContentRow = {
  cols: PageDesignerContent[];
};

export interface PageDesignerModel extends BaseUIDModel {
  tag: string;
  content: PageDesignerContentRow[];
}
