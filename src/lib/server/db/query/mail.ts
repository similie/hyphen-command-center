import type { Email } from "$lib/types";
import { EmailTable } from "../schema";
import { ModelQuery } from "./model-query";

export class EmailQuery extends ModelQuery<Email> {
  public constructor() {
    super(EmailTable);
  }
}
