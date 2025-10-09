import {
  type FormModel,
  type ApplicationModel,
  type ApplicationSubmissionModel,
  type ApplicationTokenModel,
  UserRoles,
  type UUID,
  type UserModel,
  type ApplicationSubmissionModelWithForm,
} from "$lib/types";
import { and, eq, lte } from "drizzle-orm";
import {
  FormTable,
  FormApplicationTable,
  ApplicationSubmissionTable,
  ApplicationTokenTable,
} from "../schema/form";
import { ModelQuery } from "./model-query";
import type { RequestEvent } from "@sveltejs/kit";
import { isUUID } from "$lib/utils";
import { UserQuery } from "./user";

export class FormApplicationQuery extends ModelQuery<ApplicationModel> {
  public constructor() {
    super(FormApplicationTable);
  }

  public async findMany(uids: UUID[]) {
    const applications: ApplicationModel[] = [];
    for (const uid of uids) {
      if (!isUUID(uid)) {
        continue;
      }

      const application = await this.findApp(uid);
      if (!application) {
        continue;
      }
      applications.push(application);
    }
    return applications;
  }

  public async findApp(uid: UUID) {
    if (!isUUID(uid)) {
      throw new Error("Invalid UUID format for application UID");
    }
    const conditions = [`fa.uid = '${uid}'`];
    const queryString = this.applyQueryValues(conditions);
    const results = await this.db.execute(queryString);
    return results[0] as unknown as ApplicationModel | undefined;
  }

  private applyQueryValues(
    conditions: string[],
    skip?: number,
    limit?: number,
  ) {
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const query = `
    SELECT
      fa.uid,
      fa.active,
      fa.name,
      fa.role,
      fa.created_at,
      fa.updated_at,
      jsonb_agg(to_jsonb(fm) ORDER BY array_position(uuids, fm.uid)) AS forms
    FROM (
      SELECT *,
             jsonb_array_elements_text(forms)::uuid AS form_uid,
             ARRAY(SELECT jsonb_array_elements_text(forms)::uuid) AS uuids
      FROM form_application
    ) fa
    JOIN system_form fm ON fm.uid = fa.form_uid
    ${whereClause}
    GROUP BY
      fa.uid, fa.active, fa.name, fa.uuids, fa.role, fa.created_at, fa.updated_at
    ${skip ? `OFFSET ${skip}` : ""}
    ${limit ? `LIMIT ${limit}` : ""}
  ;`;
    return query;
  }

  private buildJoinQuery(
    skip: number,
    limit: number,
    role: number,
    active?: boolean,
  ): string {
    const conditions: string[] = [];

    if (role !== undefined) {
      conditions.push(`fa.role <= ${role}`);
    }

    if (active !== undefined) {
      conditions.push(`fa.active = ${active}`);
    }
    return this.applyQueryValues(conditions, skip, limit);
  }
  private __buildJoinQuery(
    skip: number,
    limit: number,
    role: number,
    active?: boolean,
  ): string {
    let query = `
        SELECT
  fa.uid,
  fa.active,
  fa.name,
  fa.role,
  fa.created_at,
  fa.updated_at,
  jsonb_agg(to_jsonb(fm) ORDER BY array_position(uuids, fm.uid)) AS forms
FROM (
  SELECT *,
         jsonb_array_elements_text(forms)::uuid AS form_uid,
         ARRAY(SELECT jsonb_array_elements_text(forms)::uuid) AS uuids
  FROM form_application
) fa
JOIN system_form fm ON fm.uid = fa.form_uid
${"WHERE" + ` "fa"."role" = ${role} AND "fa"."active" = ${active}`}
GROUP BY fa.uid, fa.active, fa.name, fa.uuids, fa.role, fa.created_at,
  fa.updated_at
${skip ? ` OFFSET ${skip}` : ""}
${limit ? ` LIMIT ${limit}` : ""}
  ;`;

    return query;
  }

  public async all(
    skip: number,
    limit: number,
    role: number,
    active?: boolean,
  ): Promise<{ applications: ApplicationModel[]; count: number }> {
    const where = [];

    if (active || typeof active === "undefined") {
      where.push(eq(FormApplicationTable.active, true));
    } else if (!active && typeof active !== "undefined") {
      where.push(eq(FormApplicationTable.active, false));
    }

    where.push(lte(FormApplicationTable.role, role));
    const query = and(...where);
    const queryString = this.buildJoinQuery(skip, limit, role, active);
    const select = await this.db.execute(queryString);
    const [af, count] = await Promise.all([
      select,
      this.db.$count(this.table, query),
    ]);
    return { applications: af as unknown as ApplicationModel[], count };
  }
}

export class FormApplicationTokenQuery extends ModelQuery<ApplicationTokenModel> {
  public constructor() {
    super(ApplicationTokenTable);
  }
}

export class FormApplicationSubmissionQuery extends ModelQuery<ApplicationSubmissionModel> {
  private _aQuery: FormApplicationQuery;
  private _tQuery: FormApplicationTokenQuery;
  private _fQUery: FormQuery;
  public constructor() {
    super(ApplicationSubmissionTable);
    this._aQuery = new FormApplicationQuery();
    this._tQuery = new FormApplicationTokenQuery();
    this._fQUery = new FormQuery();
  }

  public async findWithApplication(
    uid: UUID,
  ): Promise<ApplicationSubmissionModelWithForm> {
    if (!isUUID(uid)) {
      throw new Error("Invalid UUID format for submission");
    }
    const results = await this.select()
      .fullJoin(
        FormApplicationTable,
        eq(FormApplicationTable.uid, ApplicationSubmissionTable.application),
      )
      .where(this.where({ uid }));
    const application =
      results.pop() as unknown as ApplicationSubmissionModelWithForm;
    const forms = [...(application?.form_application?.forms || [])] as UUID[];
    application.form_application.forms = [];
    const foundForms = await this._fQUery.find({ uid: forms });
    const formMap = new Map(foundForms.map((f) => [f.uid, f]));
    application.form_application.forms = forms.map((uid) =>
      formMap.get(uid),
    ) as FormModel[];

    return application;
  }

  public async submissionViaToken(event: RequestEvent) {
    const application = await this.findApplication(event);
    if (!application) {
      throw new Error("404:Application not found");
    }
    const { token } = event.params;
    const tokenModel = await this._tQuery.findOne({ token });
    if (tokenModel?.application !== application.uid) {
      throw new Error("403:Invalid token for this application");
    }
    const sessionUser = await UserQuery.sessionUser(event);
    const userRole = sessionUser?.role || UserRoles.BLOCKED;
    if (userRole < application.role) {
      throw new Error(
        "403:Insufficient permissions to submit this application",
      );
    }
    const submission = await this.findOne({ token });
    if (!submission) {
      return null;
    }
    if (
      userRole < UserRoles.USER_MANAGER &&
      submission.user !== sessionUser?.uid
    ) {
      throw new Error("403:Invalid token for this application");
    }
    return submission;
  }

  public async findApplication(event: RequestEvent) {
    const { uid } = event.params;
    if (!uid || !isUUID(uid)) {
      throw new Error("Invalid UUID format for application UID");
    }
    const application = await this._aQuery.findOne({ uid });
    return application;
  }

  public async createToken(application: ApplicationModel) {
    const token = await this._tQuery.createOne({
      application: application.uid,
    });
    if (!token) {
      throw new Error("Failed to create token");
    }
    return token.token;
  }

  public async verifyPermitted(event: RequestEvent) {
    const application = await this.findApplication(event);

    if (!application) {
      throw new Error("404:Application not found");
    }
    const sessionUser = await UserQuery.sessionUser(event);
    const userRole = sessionUser?.role || UserRoles.BLOCKED;
    if (userRole < application.role) {
      throw new Error(
        "403:Insufficient permissions to submit this application",
      );
    }

    return { sessionUser, application };
  }

  public async all(
    skip: number,
    limit: number,
    user: UserModel,
    application: ApplicationModel,
  ): Promise<{ submissions: ApplicationSubmissionModel[]; count: number }> {
    if (!isUUID(user.uid) || !isUUID(application.uid)) {
      throw new Error("Invalid UUID format for userId or applicationId");
    }
    const query: Partial<ApplicationSubmissionModel> = {
      application: application.uid,
      draft: false,
    };

    if (user.role < UserRoles.USER_MANAGER) {
      query.user = user.uid;
    }
    const where = this.where(query);
    const select = this.select().where(where);
    if (limit) {
      select.limit(limit);
    }

    if (skip) {
      select.offset(skip);
    }

    const [submissions, count] = await Promise.all([
      select,
      this.db.$count(this.table, where),
    ]);

    return { submissions: submissions as ApplicationSubmissionModel[], count };
  }
}

export class FormQuery extends ModelQuery<FormModel> {
  public constructor() {
    super(FormTable);
  }

  public async all(
    skip: number,
    limit: number,
    role: number,
    active?: boolean,
  ): Promise<{ forms: FormModel[]; count: number }> {
    const where = [];
    if (active || typeof active === "undefined") {
      where.push(eq(FormTable.active, true));
    } else if (!active && typeof active !== "undefined") {
      where.push(eq(FormTable.active, false));
    }

    where.push(lte(FormTable.role, role));
    const query = and(...where);

    const select = this.select().where(query);

    if (skip) {
      select.offset(skip);
    }
    if (limit) {
      select.limit(limit);
    }
    const [forms, count] = await Promise.all([
      select,
      this.db.$count(this.table, query),
    ]);
    return { forms: forms as FormModel[], count };
  }
}
