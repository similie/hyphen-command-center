import {
  type UserModel,
  type UserValidityCheck,
  type UserValidityCheckResponse,
  type UUID,
  type Registration,
  type SiteConfig,
  UserRoles,
  VerificationContext,
  type VerificationToken,
} from "$lib/types";
import bcrypt from "bcryptjs";
import { eq, and, lte, or, ilike, is } from "drizzle-orm";
import { UserTable, RegistrationTable } from "../schema";
import { ModelQuery } from "./model-query";
import jwt from "jsonwebtoken";
import { serialize, type SerializeOptions } from "cookie";
import {
  AUTHENTICATION_TOKEN_COOKIE,
  CacheKeys,
  createCacheKey,
  EllipsiesConnector,
  emailRegex,
  isUUID,
} from "$lib";
import type { RequestEvent } from "@sveltejs/kit";
import { SystemEmail } from "$lib/server/email";
import { VerificationTokenQuery } from "$lib/server/db/query";
import {
  greaterThanEqualModelSearch,
  minutesElapse,
} from "$lib/server/utils/tools";
import { RedisCache } from "$lib/server/cache";

export class RegistrationQuery extends ModelQuery<Registration> {
  private readonly verifyPath = "/users/account/verify";
  private readonly readyInterval = 60; // 1 hour
  public constructor() {
    super(RegistrationTable);
  }

  public async restrictedAccess(session: UserModel | null, body: any) {
    if (session) {
      return true;
    }

    try {
      const { token } = body;
      if (!token) {
        return false;
      }

      const registration = await this.findOne({ uid: token });
      if (!registration) {
        return false;
      }
      return registration?.active;
    } catch {}
  }

  private buildHref(register: Registration, config: SiteConfig, url: string) {
    const href =
      (url.endsWith("/") ? url.substring(0, url.length - 1) : url) +
      (config.apiBaseUrl.endsWith("/")
        ? config.apiBaseUrl.substring(0, config.apiBaseUrl.length - 1)
        : config.apiBaseUrl) +
      this.verifyPath +
      `/${register.uid}`;
    return href;
  }

  public async alreadyRegistered(email: string) {
    const found = await this.findOne({ email, active: false });
    return !!found;
  }

  public async hasOne(email: string): Promise<string> {
    const found = await this.findOne({ email, active: true });
    if (!found) {
      return "";
    }
    const ready = this.readyResend(found.emailSent);
    if (ready) {
      return found.uid;
    }
    return "__fail__";
  }

  public async generate(values: Partial<Registration>) {
    await this.update({ active: false }, { email: values.email });
    return this.createOne(values);
  }

  private templateObject(
    register: Registration,
    config: SiteConfig,
    url: string,
  ) {
    const href = this.buildHref(register, config, url);
    return { name: register.name, href, config };
  }

  private sendEmail(register: Registration, config: SiteConfig, url: string) {
    return SystemEmail.send(register.email, {
      templateName: "verify",
      data: this.templateObject(register, config, url),
    });
  }

  public readyResend(readyDate: Date = new Date()) {
    return minutesElapse(readyDate, this.readyInterval);
  }

  public async issueValidation(
    register: Registration,
    config: SiteConfig,
    url: string,
  ): Promise<{ sent: boolean; reason?: string; resend?: string }> {
    const readyDate = register.emailSent;
    try {
      const sent = await this.sendEmail(register, config, url);
      await this.update({ emailSent: new Date() }, { uid: register.uid });
      return { sent: !!sent };
    } catch (e: any) {
      const send: { sent: boolean; reason?: string; resend?: string } = {
        sent: false,
        reason: e.message,
      };
      if (this.readyResend(readyDate)) {
        send.resend = register.uid;
      }
      return send;
    }
  }
}
export class UserQuery extends ModelQuery<UserModel> {
  public static readonly SESSION_COOKIE = AUTHENTICATION_TOKEN_COOKIE;
  public static readonly TRUSTED_BROWSER = "s-trusted-browser";
  private readonly passwordResetPath = "/account/forgot-password";
  private readonly saltRounds = 10;
  public constructor(private userModel?: UserModel) {
    super(UserTable);
  }

  public signAndSetCookies(event: RequestEvent, user: UserModel) {
    const { cookies } = event;
    // we are going to update the session
    const signed = this.sign(user);
    cookies.set(UserQuery.SESSION_COOKIE, signed, this.sessionUserCookieMeta);
  }

  public static async findVerificationToken(token: string) {
    const vt = new VerificationTokenQuery();
    return vt.findOne({ token });
  }

  public async getCounts() {
    const query = `SELECT
  COALESCE(p.name, 'all') AS plan,
  COUNT(*)::int4                AS count
FROM api_key AS k
JOIN api_plan AS p
  ON k.plan = p.uid
WHERE k.active IS TRUE
GROUP BY ROLLUP(p.name)
ORDER BY
  -- put the total first (labeled “all”), then alphabetically:
  CASE WHEN p.name IS NULL THEN 0 ELSE 1 END,
  plan;`;
    return this.db.execute(query);
  }

  public async metrics() {
    const total = await this.countAll();
    const active = await this.count({ active: true });
    const inactive = await this.count({ active: false });
    const counts = await this.getCounts();
    return {
      total,
      active,
      inactive,
      counts,
    };
  }

  public static applyHyphenApiBase(event: RequestEvent, config: SiteConfig) {
    const { cookies } = event;
    const getUrl = (config: SiteConfig) => {
      return process.env.SIBLING_API_URL || config?.applicationApi || undefined;
    };
    const sessionToken = cookies.get(UserQuery.SESSION_COOKIE);
    if (!sessionToken) {
      return;
    }
    EllipsiesConnector.start(getUrl(config)).cookieValue = sessionToken;
  }

  public static async isValidUser(
    uid: UUID,
    trustedId: string,
  ): Promise<boolean> {
    CacheKeys.SESSION_VALIDATION;
    const key = createCacheKey(
      CacheKeys.SESSION_VALIDATION,
      `${uid}:${trustedId}`,
    );
    const cached = await RedisCache.get<VerificationToken>(key);
    if (cached !== null) {
      return cached.valid;
    }
    const vt = new VerificationTokenQuery();
    const token = await vt.findOne({ userId: uid, token: trustedId });
    if (token) {
      await RedisCache.set(key, token); // Cache for 1 hour
    }
    return token?.valid ?? false;
  }

  public static isAdminUser(user: UserModel | null) {
    return user !== null && user.role >= UserRoles.USER_MANAGER;
  }

  public static async isAdmin(event: RequestEvent) {
    const session = await event.locals.auth();
    if (!session || !UserQuery.isAdminUser(session.user)) {
      return null;
    }

    return session!.user;
  }

  public static async sessionUser(event: RequestEvent) {
    const session = await event.locals.auth();
    if (!session) {
      return null;
    }
    return session.user || null;
  }

  public static invalidateBrowserSessions(
    user: UserModel,
    context: string = VerificationContext.AUTHENTICATION,
  ) {
    const vt = new VerificationTokenQuery();
    return vt.update({ valid: false }, { userId: user.uid, context });
  }

  public static invalidateBrowserToken(token: string) {
    const vt = new VerificationTokenQuery();
    return vt.update({ valid: false }, { token });
  }

  public static async buildUserToken(
    user: UserModel,
    context: string = VerificationContext.AUTHENTICATION,
    invalidateAll = false,
  ) {
    const vt = new VerificationTokenQuery();
    // if we do this, it will remove the user from all browser sessions
    if (invalidateAll) {
      await this.invalidateBrowserSessions(user, context);
    }
    return vt.createToken(user, context);
  }

  public static getSession(event: RequestEvent) {
    const { cookies } = event;
    return cookies.get(UserQuery.SESSION_COOKIE) || "";
  }

  public static filterPasswords(users: UserModel[] | UserModel) {
    const uq = new UserQuery();
    return uq.filterAllPasswords(Array.isArray(users) ? users : [users]);
  }

  private filterAllPasswords(users: UserModel[]) {
    return users.map((user) => this.omitPassword(user));
  }

  public async updatePassword(password: string, uid: UUID) {
    const hashedPassword = await this.hash(password);
    const updated = await this.update(
      { password: hashedPassword, resetPassword: false },
      { uid },
    );
    return this.omitPassword(updated.pop() as UserModel);
  }

  async valid(validity: UserValidityCheck): Promise<UserValidityCheckResponse> {
    const validityCheck: UserValidityCheckResponse = {};
    for (const key in validity) {
      const paramName = key as keyof UserValidityCheck;
      if (!validity[paramName]) {
        continue;
      }
      const value = validity[paramName] as string;
      const param: Partial<Record<keyof UserModel, string>> = { [key]: value };
      const results = await this.select().where(this.where(param));
      validityCheck[paramName] = results.length === 0;
    }

    return validityCheck;
  }

  private processSearchParams(
    search: string = "",
    active = true,
    role?: number,
  ) {
    if (!this.userModel) {
      throw new Error("User not found");
    }

    // is search is a url get the last slash part
    if (search && search.match(/^https?:\/\//)) {
      const parts = search.split("/");
      search = parts.pop() || "";
    }

    const searchConditions = search
      ? [
          ilike(UserTable.email, `%${search.toLowerCase()}%`),
          ilike(UserTable.username, `%${search.toLowerCase()}%`),
          ilike(UserTable.name, `%${search.toLowerCase()}%`),

          // cast uid to text so ilike works
        ]
      : [];
    if (search && isUUID(search)) {
      searchConditions.length = 0;
      searchConditions.push(eq(UserTable.uid, search));
    }

    const searchRole =
      typeof role !== "undefined" && role > -1 && role < this.userModel.role
        ? eq(UserTable.role, role)
        : lte(UserTable.role, this.userModel.role);

    return and(
      searchRole,
      eq(UserTable.active, active),
      searchConditions.length > 0 ? or(...searchConditions) : undefined,
    );
  }

  async countAllSearchUsers(search: string = "", active = true, role?: number) {
    const count = await this.db.$count(
      UserTable,
      this.processSearchParams(search, active, role),
    );
    return count;
  }

  async all(
    skip = 0,
    limit = 0,
    active = true,
    search?: string,
    role?: number,
  ) {
    const query = this.select()
      .where(this.processSearchParams(search, active, role))
      .orderBy(UserTable.name);

    if (skip) {
      query.offset(skip);
    }

    if (limit) {
      query.limit(limit);
    }

    const users = (await query.execute()) as UserModel[];
    return this.filterAllPasswords(users);
  }

  public isEmailVerified(identifier: string) {
    return emailRegex.test(identifier);
  }

  public isTokenExpiring(decoded: jwt.JwtPayload, thresholdInSeconds = 300) {
    if (!decoded.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;
    if (timeRemaining < 0) {
      throw new Error("Token has already expired");
    }
    // Check if the token is about to expire within the threshold
    return timeRemaining < thresholdInSeconds;
  }

  public static setTokenToHeaders(sessionJWTToken: String) {
    return {
      Authorization: `Bearer ${sessionJWTToken}`,
    };
  }

  public get sessionUserCookieMeta(): SerializeOptions & {
    path: string;
  } {
    const isSecure =
      process.env.NODE_ENV === "production" &&
      process.env.SECURE_HOST === "true";
    return {
      path: "/",
      httpOnly: false,
      secure: isSecure,
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
    };
  }

  public cookieDetails(signedUser: string) {
    return serialize(
      UserQuery.SESSION_COOKIE,
      signedUser,
      this.sessionUserCookieMeta,
    );
  }

  public cookieHeaders(signedUser: string) {
    return {
      "Set-Cookie": this.cookieDetails(signedUser),
    };
  }

  public decode(token: string) {
    const decoded: jwt.JwtPayload & { user: UserModel } = jwt.verify(
      token,
      process.env.JWT_CLIENT_SECRET || "your-session-secret",
    ) as jwt.JwtPayload & { user: UserModel };
    return decoded;
  }

  public sign(user: UserModel) {
    const sessionToken = jwt.sign(
      { uid: user.uid, user: user },
      process.env.JWT_CLIENT_SECRET || "your-session-secret",
      { expiresIn: "1h", algorithm: "HS256" },
    );
    return sessionToken;
  }

  private hash(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  private compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  public omitPassword(user: UserModel): UserModel {
    if (user && user?.password) {
      delete user?.password;
    }
    return user;
  }

  private async rebuildWithPassword(user: Partial<UserModel>) {
    const { password, ...rest } = user;
    if (!password) {
      throw new Error("Password is required");
    }
    const hashedPassword = await this.hash(password);
    return {
      ...rest,
      password: hashedPassword,
    };
  }

  public sendResponseWithUpdatedUser(user: UserModel) {
    const signed = this.sign(user);
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        ...this.cookieHeaders(signed),
        "Content-Type": "application/json",
      },
    });
  }

  private stripPubliclyAlteredFields(
    user: Partial<UserModel>,
  ): Partial<UserModel> {
    const keys: (keyof UserModel)[] = [
      "registered",
      "role",
      "active",
      "uid",
      "email_verified",
      "resetPassword",
    ];
    const rest = { ...user };
    for (const key of keys) {
      delete rest[key];
    }
    return rest as Partial<UserModel>;
  }

  public async updateUser(
    values: Partial<UserModel>,
    where: Partial<Record<keyof UserModel, any>>,
  ) {
    const sendUpdate = values.password
      ? await this.rebuildWithPassword(values)
      : values;

    if (this.userModel && UserQuery.isAdminUser(this.userModel)) {
      const updated = await this.update(sendUpdate, where);
      return this.filterAllPasswords(updated as UserModel[]);
    }
    const users = await this.find(where);
    for (const user of users) {
      if (!this.userModel || this.userModel.uid !== user.uid) {
        throw new Error("Unauthorized");
      }
    }
    const updated = await this.update(
      this.stripPubliclyAlteredFields(sendUpdate),
      where,
    );
    return this.filterAllPasswords(updated as UserModel[]);
  }

  public async insertUser(payload: Partial<UserModel>) {
    const user = await this.rebuildWithPassword(payload);
    const results = await this.insert(user);
    return this.omitPassword(results.pop() as UserModel);
  }

  public async validPassword(password: string, userUid: UUID) {
    const results = await this.select().where(eq(UserTable.uid, userUid));
    const [user] = results;
    if (!user) {
      throw new Error("User not found");
    }
    const match = await this.compare(password, user.password);
    if (!match) {
      throw new Error("Password does not match");
    }
    return { valid: true };
  }

  public override async createOne(
    values: Partial<UserModel>,
    resetPassword = true,
  ): Promise<UserModel> {
    const password = values.password;
    if (!password) {
      throw new Error("We need a password to generate a user account");
    }
    values.password = await this.hash(password);
    values.resetPassword = resetPassword;
    const count = await this.countAll();
    // our first user
    if (!count) {
      values.role = UserRoles.ADMIN;
    }

    const created = await super.createOne({ ...values });
    if (!created) {
      throw new Error("Could not create user account");
    }
    delete created?.password;
    return created;
  }

  setTrustedCookie = (value = "true") => {
    const isSecure =
      process.env.NODE_ENV === "production" &&
      process.env.SECURE_HOST === "true";
    const trustedCookie = serialize(
      UserQuery.TRUSTED_BROWSER, // e.g. "s-trusted-browser"
      value, // or any value to indicate trust
      {
        path: "/",
        httpOnly: false,
        secure: isSecure,
        maxAge: 7 * 24 * 60 * 60, // 1 week in seconds
        sameSite: "strict",
      },
    );
    return trustedCookie;
  };

  setTrustedCookieResponse(data: any = {}, setValue?: string) {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    headers.append("Set-Cookie", this.setTrustedCookie(setValue));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: headers,
    });
  }

  async setLoginCookie(
    user: UserModel,
    trusted = false,
    setValue?: string,
  ): Promise<Response> {
    const signed = this.sign(user);
    const cookieHeaders = [this.cookieDetails(signed)];
    if (trusted) {
      cookieHeaders.push(this.setTrustedCookie(setValue));
    }
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    cookieHeaders.forEach((cookie) => headers.append("Set-Cookie", cookie));
    return new Response(JSON.stringify({ success: true, user: user }), {
      status: 200,
      headers: headers,
    });
  }

  public static logout(event: RequestEvent) {
    event.cookies.delete(UserQuery.SESSION_COOKIE, { path: "/" });
  }

  async login(credentials: { identifier: string; password: string }) {
    const _eq = this.isEmailVerified(credentials.identifier)
      ? eq(UserTable.email, credentials.identifier)
      : eq(UserTable.username, credentials.identifier);

    const results = await this.select().where(
      and(_eq, eq(UserTable.active, true)),
    );
    const [user] = results;
    if (!user) {
      throw new Error("User not found");
    }
    const match = await this.compare(credentials.password, user.password);
    if (!match) {
      throw new Error("Password does not match");
    }
    return this.omitPassword(user as UserModel);
  }

  private buildPasswordChangeHref(token: string, url: string) {
    const href =
      (url.endsWith("/") ? url.substring(0, url.length - 1) : url) +
      this.passwordResetPath +
      `/${token}`;
    return href;
  }

  private sendPasswordResetEmail(
    email: string,
    data: { name: string; href: string; config: SiteConfig },
  ) {
    return SystemEmail.send(email, {
      templateName: "password",
      data,
    });
  }

  public async hasActivePasswordSession(user: UserModel) {
    const vt = new VerificationTokenQuery();
    const search = {
      userId: user.uid,
      context: VerificationContext.RESET_PASSWORD,
      created_at: greaterThanEqualModelSearch(15),
      valid: true,
    };
    const token = await vt.findOne(search);
    return !!token && token.valid;
  }

  public async resetPassword(user: UserModel, config: SiteConfig, url: string) {
    const sessionType = VerificationContext.RESET_PASSWORD;
    await UserQuery.invalidateBrowserSessions(user, sessionType);
    const token = await UserQuery.buildUserToken(user, sessionType);
    const href = this.buildPasswordChangeHref(token, url);
    const name = user.name;
    return this.sendPasswordResetEmail(user.email, { href, name, config });
  }
}
