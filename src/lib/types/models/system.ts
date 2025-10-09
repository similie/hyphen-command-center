import type { BaseUIDModel, UUID } from "./base-model";
import type { UserRoles } from "./user";
import type { Component } from "svelte";
export interface SiteRoutingModel extends BaseUIDModel {
  pageName: string;
  path: string;
  public: boolean;
  description?: string;
  active: boolean;
  params: Record<string, any>;
  role: UserRoles;
  config: UUID;
  method?: string;
}

export enum LinkPermission {
  EQ = "eq",
  LESS = "less",
  DEFAULT = "default",
}

export type SidebarLink = {
  type: string;
  href: string;
  label: string;
  icon?: Component;
  name: string;
  classes: string;
  role: UserRoles;
  links?: SidebarLink[];
  exact?: LinkPermission;
};
