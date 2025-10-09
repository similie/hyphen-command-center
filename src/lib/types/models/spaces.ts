import type { BaseUIDModel, UUID } from "./base-model";
import type { UserRoles } from "./user";

export interface SpaceTags extends BaseUIDModel {
  tag: string;
}

export interface SpaceTagReference extends BaseUIDModel {
  tag: UUID;
  space: UUID;
}

export interface SpacesModel extends BaseUIDModel {
  name: string;
  description: string;
  teaser: string;
  image: UUID;
  weight: number;
  grandFatheredOn: Date;
  price: number;
  active: boolean;
  btnText?: string;
  featured: boolean;
  gatewayPlanId: string;
  gatewayPriceId: string;
  role: UserRoles;
  tags?: UUID[];
}
