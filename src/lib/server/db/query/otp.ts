import { isEmail, isPhone } from "$lib/utils/security";
import {
  type OTP,
  type UserModel,
  type UUID,
  type VerificationToken,
} from "$lib/types/models";
import { greaterThanModelSearch } from "$lib/server/utils/tools";
import { OPT_EXPIRE_IN_MINUTES, toHash } from "$lib/server/utils/security";
import { UserQuery } from "$lib/server/db/query";
import { OtpTable, VerificationTokenTable } from "../schema";
import { ModelQuery } from "./model-query";
import { SystemEmail } from "$lib/server/email";

export class VerificationTokenQuery extends ModelQuery<VerificationToken> {
  public constructor() {
    super(VerificationTokenTable);
  }

  public async createToken(user: UserModel, context?: string): Promise<string> {
    const created = await this.createOne({
      valid: true,
      userId: user.uid,
      context,
    });

    if (!created || !created.token) {
      throw new Error("Failed to generate token");
    }
    return created.token;
  }

  public async validToken(token: string): Promise<boolean> {
    const found = await this.find({
      token,
      created_at: OtpQuery.createdAtSearch(15),
      valid: true,
    });
    return !!found.length;
  }
}

export class OtpQuery extends ModelQuery<OTP> {
  private readonly uq: UserQuery;
  constructor() {
    super(OtpTable);
    this.uq = new UserQuery();
  }

  private templateObject(passcode: string) {
    return { passcode, expire: OPT_EXPIRE_IN_MINUTES };
  }

  public isValueIdentity(value: string) {
    return isPhone(value) || isEmail(value);
  }

  private sendEmail(email: string, otp: string) {
    return SystemEmail.send(email, {
      templateName: "otp",
      data: this.templateObject(otp),
    });
  }

  public static createdAtSearch(time = OPT_EXPIRE_IN_MINUTES) {
    return greaterThanModelSearch(time);
  }

  public async validateOTP(values: Partial<OTP>) {
    if (!values.identifier || !this.isValueIdentity(values.identifier)) {
      throw new Error("Invalid identity Provided");
    }
    await this.invalidateAllOtp(values.identifier);
  }

  public async findOtpByUsernameIdentifier(
    identifier: string,
  ): Promise<Partial<Record<keyof OTP, any>>> {
    if (this.isValueIdentity(identifier)) {
      return {
        identifier,
        active: true,
        created_at: OtpQuery.createdAtSearch(),
      };
    }

    const user = await this.uq.findOne({ username: identifier });
    if (!user) {
      throw new Error("User is not found");
    }

    const search: string[] = [];
    if (user.email) {
      search.push(user.email);
    }

    if (user.phone) {
      search.push(user.phone);
    }
    if (!search.length) {
      throw new Error("User has not valid contact details");
    }
    // or(...search.map(m => eq(OtpTable.identifier, m ))
    return {
      identifier: search,
      active: true,
      created_at: OtpQuery.createdAtSearch(),
    };
  }

  public issueOTP = async (otp: OTP) => {
    const otpValue = otp.otp;
    const sendObject: Partial<OTP> = {
      ...otp,
    };
    // we never want to send the value of the otp to the client
    if (process.env.NODE_ENV !== "test") {
      delete sendObject.otp;
      delete sendObject.identifier;
    }

    if (!otp.identifier) {
      throw new Error("No identifier Found");
    }

    if (!otpValue) {
      throw new Error("No OTP found");
    }

    if (isEmail(otp.identifier)) {
      // don't wait to send the email
      this.sendEmail(otp.identifier, otpValue);
    }
    otp.otp = await toHash(otpValue);
    await this.update(otp, { uid: otp.uid });
    return sendObject as OTP;
  };

  public async invalidateAllOtpByIdentity(uid: UUID) {
    return this.update({ active: false }, { uid });
  }

  public async invalidateAllOtpByUserIdentity(userId: UUID) {
    return this.update({ active: false }, { userId, active: true });
  }

  public async invalidateAllOtp(identifier: string) {
    return this.update({ active: false }, { identifier, active: true });
  }

  public async createOTP(values: Partial<OTP>) {
    await this.validateOTP(values);
    const created = await this.insert(values);
    const createdOtp = (Array.isArray(created) ? created[0] : created) as OTP;
    if (!createdOtp) {
      throw new Error("Failed to create the OTP");
    }
    return this.issueOTP(createdOtp);
  }

  public loginOtp(user: UserModel) {
    if (!user.email || !user.uid) {
      throw new Error("User is not valid");
    }
    const otp = {
      identifier: user.email,
      userId: user.uid,
    };
    return this.createOTP(otp);
  }

  public async otpUser(identifier: string): Promise<UserModel | null> {
    const search: Partial<Record<keyof UserModel, any>> = {};
    if (isEmail(identifier)) {
      search.email = identifier;
    } else {
      search.phone = identifier;
    }

    const user = await this.uq.findOne(search);
    return user || null;
  }
}
