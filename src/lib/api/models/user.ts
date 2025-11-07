import { ApiModel } from "../base";
import {
  isUUID,
  siteUser,
  siteUserInstance,
  type CartItem,
  type LoginResponse,
  type ProductsModel,
  type Registration,
  type UserModel,
  type UserValidityCheck,
  type UUID,
  type ValidOTP,
} from "$lib";
import { goto } from "$app/navigation";

export class UserApi extends ApiModel<UserModel> {
  private readonly loginCheckIntervalSeconds = 60;
  private static _interval: ReturnType<typeof setInterval> | null = null;
  public constructor() {
    super("users");
  }
  private static readonly fieldValidators: Record<
    string,
    (value: string | undefined, user?: Partial<UserModel>) => boolean | string
  > = {
    name: (value) => !!value,
    email: (value) => !!value && value.includes("@"),
    password: (value, user) =>
      (user && user.uid) || (!!value && value.length >= 8),
    username: (value) => !!value && value.length >= 8,
  };

  public async removeFromCart(sku: string): Promise<CartItem[]> {
    const results = await this.delete(this.urlSet(`cart/${sku}`), {
      body: JSON.stringify({}),
    });
    const items = await results.json();
    return items as CartItem[];
  }

  public async addToCart(
    product: ProductsModel,
    qty: number = 1,
    locked: boolean = false,
  ): Promise<CartItem[]> {
    const results = await this.post(this.urlSet(`cart/${product.sku}`), {
      body: JSON.stringify({ qty, locked }),
    });
    const items = await results.json();
    return items as CartItem[];
  }

  public static fieldValidator(
    user: Partial<UserModel>,
    requiredFields: string[] = ["name", "email", "password", "username"],
  ) {
    const required = requiredFields.map((field) => {
      // Use assertion that field is a key of fieldValidators
      const value = user[field as keyof UserModel] as string | undefined;
      const validator =
        UserApi.fieldValidators[field as keyof typeof UserApi.fieldValidators];
      if (validator && !validator(value, user)) {
        return false;
      }
      return true;
    });
    return required.every((r) => r);
  }

  async profile(userUid: UUID, profile: Partial<UserModel>) {
    const results = await this.patch(
      this.urlSet(`${userUid}/profile`),
      this.parseBody(profile),
    );
    return results.json();
  }

  async resetPassword(userUid: UUID, password: string): Promise<UserModel> {
    const results = await this.patch(
      this.urlSet(`${userUid}/reset-password`),
      this.parseBody({ password }),
    );
    return results.json();
  }

  async resetPublicUserPassword(
    token: string,
    password: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const results = await this.post(
      this.urlSet(`account/password/change`),
      this.parseBody({ password, token }),
    );
    if (results.status !== 200) {
      throw new Error("Password Reset Attempt Failed");
    }
    return results.json();
  }

  async all() {
    const results = await this.get(this.urlSet(""));
    return results.json();
  }

  async search(
    search: string,
    skip = 0,
    limit = 30,
    role?: number,
  ): Promise<{
    users: UserModel[];
    count: number;
  }> {
    let queryString = `search=${search}&skip=${skip}&limit=${limit}`;
    if (typeof role !== "undefined") {
      queryString += `&role=${role}`;
    }
    const results = await this.get(this.urlSet(`search?${queryString}`));
    return results.json();
  }

  async validPassword(userUid: UUID, password: string) {
    const results = await this.post(
      this.urlSet(`${userUid}/valid-password`),
      this.parseBody({ password }),
    );
    return results.json() as Promise<{ valid: boolean }>;
  }

  async validEmail(email: string) {
    const results = await this.post(this.urlSet("search"), {
      ...this.parseBody({ email }),
    });
    const validity = await results.json();
    return !!validity.valid;
  }

  async valid(valid: UserValidityCheck, token?: string) {
    const headers: { token?: string } = {};
    if (token) {
      headers.token = token;
    }
    const results = await this.post(this.urlSet("valid"), {
      ...this.parseBody(valid),
      headers,
    });
    return results.json();
  }
  async login(credentials: {
    identifier: string;
    password: string;
  }): Promise<LoginResponse | null> {
    const results = await this.post(this.urlSet("login"), {
      ...this.parseBody(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    });
    try {
      if (results.ok) {
        return await results.json();
      } else {
        throw new Error(`Login failed: ${results.statusText}`);
      }
    } catch (e) {
      console.error("ERROR LOGGING IN", e);
    }
    return null;
  }
  async logout(): Promise<Response> {
    return this.get(this.urlSet("logout"));
  }

  public removeLoginCheck() {
    UserApi._interval && clearInterval(UserApi._interval);
  }

  public async resendVerificationEmail(
    token: string,
  ): Promise<{ ok: boolean; message?: string; resend?: string }> {
    const results = await this.post(this.urlSet("account/invite/resend"), {
      ...this.parseBody({ token }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return results.json();
  }

  async startAccount(
    registration: Partial<Registration>,
  ): Promise<{ ok: boolean; message?: string; resend?: string }> {
    const results = await this.post(this.urlSet("account/start"), {
      ...this.parseBody(registration),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return results.json();
  }

  async accountCreate(
    registration: Partial<UserModel & Registration>,
  ): Promise<LoginResponse | null> {
    const results = await this.post(this.urlSet("account/complete"), {
      ...this.parseBody(registration),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return results.json();
  }

  async maintainSession(): Promise<{ ok: boolean }> {
    console.log("Maintaining session...", this.urlSet("session"));
    const results = await this.get(this.urlSet("session"));
    return results.json();
  }

  async runLoginCheck() {
    this.removeLoginCheck();
    UserApi._interval = setInterval(async () => {
      try {
        const thisUser = await siteUserInstance();
        if (!thisUser) {
          return this.removeLoginCheck();
        }

        const results = await this.get(this.urlSet("tap"));
        if (results.status !== 200) {
          return;
        }
        const json = await results.json();
        if (json.ok) {
          return;
        }
        siteUser.set(undefined);
        goto("/signin");
        this.removeLoginCheck();
      } catch (e) {
        console.error("ERROR RUNNING LOGIN CHECK", e);
      }
    }, 1000 * this.loginCheckIntervalSeconds);
  }

  async resendOtp() {
    const results = await this.post(this.urlSet("account/otp/resend"), {});
    return results.json();
  }

  async validateOtp(code: string): Promise<ValidOTP> {
    const results = await this.post(this.urlSet("account/otp/verify"), {
      ...this.parseBody({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (results.status !== 200) {
      throw new Error("OTP Verification Failed");
    }
    return results.json();
  }

  async setPasswordReset(
    identifier: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const results = await this.post(this.urlSet("account/password/reset"), {
      ...this.parseBody({ identifier }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (results.status !== 200) {
      throw new Error("Password Reset Attempt Failed");
    }
    return results.json();
  }

  async findOne(uid: UUID) {
    if (!isUUID(uid)) {
      throw new Error("Invalid ID");
    }

    const results = await this.get(this.urlSet(`${uid}`));
    return results.json();
  }
}
