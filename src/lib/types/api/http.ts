import type { BaseModel, BaseUIDModel } from "../models";

/**
 * The HTTP method for a given request
 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  ALL = "*",
}

export const HttpMethodName: Record<HttpMethod, string> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  "*": "All",
};

export type PutQueryModel<T extends BaseModel | BaseUIDModel> = {
  where: any;
  values: Partial<T>;
};
