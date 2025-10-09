import type { BaseUIDModel, UUID } from "./base-model";
import type { UserRoles } from "./user";

/** Interface for a DocumentTable ORM class, aka `source_doc` in the DB */
export interface ApplicationDocumentModel extends BaseUIDModel {
  ownerUid?: UUID;
  size: number;
  name: string;
  original_file?: Buffer;
  lg_file?: Buffer;
  md_file?: Buffer;
  sm_file?: Buffer;
  type: string;
  alt?: string;
  role?: UserRoles;
}

export interface DocumentHashModel extends BaseUIDModel {
  hash: string;
  doc_uid: UUID;
  // hash_string?: string;
}
