import {
  isUUID,
  UserRoles,
  type ApplicationModel,
  type FormModel,
  type ApplicationSubmissionModel,
  type UUID,
  type UserModel,
  type ApplicationSubmissionModelWithForm,
} from "$lib";
import { ApiModel } from "../base";
export class FormApi extends ApiModel<FormModel> {
  public constructor() {
    super("forms");
  }

  async all(skip: number, limit: number, role: UserRoles, active = true) {
    const results = await this.get(
      this.urlSet("", {
        skip,
        limit,
        role,
        active,
      }),
    );
    return results.json();
  }
}

export class FormApplicationApi extends ApiModel<ApplicationModel> {
  public constructor() {
    super("forms/applications");
  }

  public async getSubmission(
    submission: UUID,
  ): Promise<ApplicationSubmissionModelWithForm> {
    if (!isUUID(submission)) {
      throw new Error("Invalid UUID format for submission");
    }
    const results = await this.get(this.urlSet(`submissions/${submission}`));
    return results.json();
  }

  public async getForms(application: UUID) {
    if (!isUUID(application)) {
      throw new Error("Invalid UUID format for application or form");
    }
    const result = await this.get(this.urlSet(`${application}`));
    return result.json() as unknown as ApplicationModel;
  }

  public async addForm(application: UUID, form: UUID) {
    if (!isUUID(application) || !isUUID(form)) {
      throw new Error("Invalid UUID format for application or form");
    }
    const results = await this.post(this.urlSet(`${application}/${form}`));
    return results.json();
  }

  public async removeForm(application: UUID, form: UUID) {
    if (!isUUID(application) || !isUUID(form)) {
      throw new Error("Invalid UUID format for application or form");
    }
    const results = await this.delete(this.urlSet(`${application}/${form}`));
    return results.json();
  }

  async findMany(
    uids: UUID[],
  ): Promise<{ applications: ApplicationModel[]; count: number }> {
    const results = await this.get(this.urlSet("?uid=" + uids.join(",")));
    return results.json();
  }

  async all(skip: number, limit: number, role: UserRoles, active = true) {
    const results = await this.get(
      this.urlSet("", {
        skip,
        limit,
        role,
        active,
      }),
    );
    return results.json();
  }
}

export class ApplicationSubmissionApi extends ApiModel<ApplicationSubmissionModel> {
  public constructor(private application: ApplicationModel) {
    super(`forms/applications/${application.uid}/submit`);
  }

  public async searchSession(applicationSession: UUID) {
    if (!isUUID(applicationSession)) {
      throw new Error("Invalid UUID format for application session");
    }
    const results = await this.get(
      this.urlSet(`sessions/${applicationSession}`),
    );
    return results.json();
  }

  public applicationKey(
    user: UserModel | undefined,
    identifier?: string | UUID,
  ) {
    let userKey = user ? user.uid : "guest";
    return `application_${userKey}_${this.application.uid}${
      identifier ? `_${identifier}` : ""
    }`;
  }

  async all(skip: number, limit: number) {
    const results = await this.get(
      this.urlSet("", {
        skip,
        limit,
      }),
    );
    return results.json();
  }

  public async start(): Promise<ApplicationSubmissionModel> {
    const result = await this.post(this.urlSet("start"));
    return result.json();
  }

  public async complete(
    values: Record<string, any>,
    token: string,
  ): Promise<ApplicationSubmissionModel> {
    const result = await this.post(
      this.urlSet(`${token}`),
      this.parseBody(values),
    );
    return result.json();
  }

  public async retrieve(token: string): Promise<ApplicationSubmissionModel> {
    const result = await this.get(this.urlSet(`${token}`));
    return result.json();
  }

  public async save(
    values: Record<string, any>,
    token: string,
  ): Promise<ApplicationSubmissionModel> {
    const result = await this.put(
      this.urlSet(`${token}`),
      this.parseBody(values),
    );
    return result.json();
  }
}
