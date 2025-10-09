import type { UUID, BaseUIDModel } from "./base-model";

export const isAdminUser = (user: UserModel): boolean => {
  return user.role >= UserRoles.ADMIN;
};

export const requiresRegistration = (user?: UserModel): boolean => {
  if (!user) {
    return false;
  }

  if (user.role !== UserRoles.GUEST) {
    return false;
  }

  if (user.registered) {
    return false;
  }
  const value = user.applicationComplete ?? true;
  return !value;
};

export enum UserRoles {
  UNRESTRICTED = -1,
  ADMIN = 5,
  USER_MANAGER = 4,
  MANAGER = 3,
  USER = 2,
  GUEST = 1,
  BLOCKED = 0,
}

export const UserRolesStringsNames = {
  "-1": "Unrestricted",
  "5": "Admin",
  "4": "User Manager",
  "3": "Instructor",
  "2": "Patron",
  "1": "Student",
  "0": "Public",
};

export enum UserRolesStrings {
  BLOCKED = "Public",
  GUEST = "Student",
  USER = "Patron",
  MANAGER = "Instructor",
  USER_MANAGER = "Manager",
  ADMIN = "Admin",
}

export type UserValidityCheck = {
  username?: string;
  email?: string;
};

export type UserValidityCheckResponse = {
  username?: boolean;
  email?: boolean;
};

export enum UserValidityResults {
  PRISTINE = 0,
  INVALID = -1,
  VALID = 1,
}

export interface UserModel extends BaseUIDModel {
  name: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  role: UserRoles;
  avatar: UUID;
  client: string;
  email_verified: boolean;
  active: boolean;
  resetPassword: boolean;
  bio?: string;
  optOut: boolean;
  registered?: boolean;
  applicationComplete?: boolean;
  application?: UUID;
}

export type Session = {
  uid: UUID;
  user: UserModel;
  iat: number;
  exp: number;
};

export type LoginResponse = {
  success: boolean;
  user: UserModel;
};

export interface Registration extends BaseUIDModel {
  name: string;
  email: string;
  verified: boolean;
  emailSent: Date;
  active: boolean;
}
export interface LicenseAgreementModel extends BaseUIDModel {
  name: string;
  description: string;
  content: string;
  active: boolean;
  config: UUID;
}
