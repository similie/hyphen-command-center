import type {
  SpacesModel,
  SiteConfig,
  SpaceTags,
  UserRoles,
  UUID,
  SpaceTagReference,
} from "$lib/types";
import { asc, eq, lte, SQL, sql } from "drizzle-orm";
import { ModelQuery } from "./model-query";
import { PaymentService } from "$lib/server/utils/payments";
import {
  SpaceTagsReferenceTable,
  SpaceTagsTable,
  SpacesTable,
} from "../schema/spaces";
import { isUUID } from "$lib/utils";

export class SpacesQuery extends ModelQuery<SpacesModel> {
  private readonly payment: PaymentService;
  private readonly tQuery: SpaceTagReferences;
  private readonly removePayments = true;
  public constructor(private readonly config?: SiteConfig) {
    super(SpacesTable);
    this.payment = new PaymentService();
    this.tQuery = new SpaceTagReferences();
  }

  public static isFreePlan(plan: SpacesModel): boolean {
    return plan.price === 0;
  }

  private buildSpacesCountSQL(opts: {
    tags?: string[]; // UUID[]
    search?: string;
    role?: number; // UserRoles underlying value
  }): SQL {
    const whereParts: SQL[] = [sql` s.active = true `];

    if (opts.role !== undefined) {
      whereParts.push(sql` s.role <= ${sql.param(opts.role)} `);
    }

    if (opts.search && opts.search.trim() !== "") {
      const pattern = `%${opts.search}%`;
      whereParts.push(
        sql` (s.name ILIKE ${sql.param(
          pattern,
        )} OR s.description ILIKE ${sql.param(pattern)}) `,
      );
    }

    if (opts.tags && opts.tags.length > 0) {
      // ANY-of tags
      const tagArray = sql`ARRAY[${sql.join(
        opts.tags.map((t) => sql.param(t)),
        sql`, `,
      )}]::uuid[]`;

      whereParts.push(sql`
      EXISTS (
        SELECT 1
        FROM space_tags_reference str_f
        WHERE str_f.space = s.uid
          AND str_f.tag = ANY(${tagArray})
      )
    `);
    }

    const whereSQL = whereParts.length
      ? sql` WHERE ${sql.join(whereParts, sql` AND `)} `
      : sql``;

    // Final: just the count of spaces matching filters
    return sql/* sql */ `
    SELECT COUNT(*)::int AS total
    FROM "space" AS s
    ${whereSQL};
  `;
  }

  private buildSpacesWithJsonTagsSQL(opts: {
    tags?: string[]; // UUID[]
    search?: string;
    role?: number; // UserRoles underlying value
    skip?: number;
    limit?: number;
    uuids?: UUID[];
  }): SQL {
    // ---- WHERE pieces (all parameterized) ----
    const whereParts: SQL[] = [sql` s.active = true `];
    if (opts.uuids && opts.uuids.length > 0) {
      const uuidArray = sql`ARRAY[${sql.join(
        opts.uuids.map((id) => sql.param(id)),
        sql`, `,
      )}]::uuid[]`;
      whereParts.push(sql` s.uid = ANY(${uuidArray}) `);
    }

    if (opts.role !== undefined) {
      whereParts.push(sql` s.role <= ${sql.param(opts.role)} `);
    }

    if (opts.search && opts.search.trim() !== "") {
      const pattern = `%${opts.search}%`;
      whereParts.push(
        sql` (s.name ILIKE ${sql.param(
          pattern,
        )} OR s.description ILIKE ${sql.param(pattern)}) `,
      );
    }

    if (opts.tags && opts.tags.length > 0) {
      // Build ARRAY[...]::uuid[] safely
      const tagArray = sql`ARRAY[${sql.join(
        opts.tags.map((t) => sql.param(t)),
        sql`, `,
      )}]::uuid[]`;
      // ANY-of filter
      whereParts.push(sql`
      EXISTS (
        SELECT 1
        FROM space_tags_reference str_f
        WHERE str_f.space = s.uid
          AND str_f.tag = ANY(${tagArray})
      )
    `);
    }

    const whereSQL = whereParts.length
      ? sql` WHERE ${sql.join(whereParts, sql` AND `)} `
      : sql``;

    // ---- Pagination (optional) ----
    const limitSQL =
      opts.limit !== undefined ? sql` LIMIT ${sql.param(opts.limit)} ` : sql``;
    const offsetSQL =
      opts.skip !== undefined ? sql` OFFSET ${sql.param(opts.skip)} ` : sql``;

    // ---- Final query (flat table: all space columns + tags json) ----
    return sql`
    WITH filtered AS (
      SELECT s.*
      FROM "space" AS s
      ${whereSQL}
      ORDER BY s.weight
      ${limitSQL}
      ${offsetSQL}
    )
    SELECT
      f.*,
      COALESCE(t.tags, '[]'::json) AS tags
    FROM filtered f
    LEFT JOIN LATERAL (
      SELECT COALESCE(json_agg(DISTINCT str.tag), '[]'::json) AS tags
      FROM space_tags_reference str
      WHERE str.space = f.uid
    ) AS t ON TRUE;
  `;
  }

  public async loadSpace(uid: UUID): Promise<SpacesModel | null> {
    if (!isUUID(uid)) {
      throw new Error("Invalid space UID");
    }
    const space = await this.findOne({ uid });
    if (!space) {
      return null;
    }
    const tags = await this.tQuery.find({ space: uid });
    space.tags = tags.map((t) => t.tag);
    return space;
  }

  public async all(
    tags?: string[],
    search?: string,
    role?: UserRoles,
    skip?: number,
    limit?: number,
    uuids?: UUID[],
  ): Promise<{ spaces: SpacesModel[]; count: number }> {
    const where: SQL<any>[] = [eq(SpacesTable.active, true)];
    if (role !== undefined) {
      where.push(lte(SpacesTable.role, role));
    }
    const query = this.buildSpacesWithJsonTagsSQL({
      tags,
      search,
      role,
      skip,
      limit,
      uuids,
    });

    const cQuery = this.buildSpacesCountSQL({ tags, search, role });
    const cRows = await this.db.execute<{ total: number }>(cQuery);
    const rows = await this.db.execute(query);
    const results = this.convertTableValues<SpacesModel>(
      rows,
      SpacesTable,
    ) as SpacesModel[];

    return { spaces: results, count: cRows[0]?.total || 0 };
  }

  public override async createOne(
    values: Partial<SpacesModel>,
  ): Promise<SpacesModel | null> {
    const space = await super.createOne(values);
    if (!space) {
      return null;
    }
    if (!this.removePayments) {
      const price = await this.payment.createSubscriptionItem(
        space,
        this.config!,
      );
      space.gatewayPriceId = price.id;
      space.gatewayPlanId =
        typeof price.product === "string" ? price.product : price.product.id;
      await super.update(
        {
          gatewayPlanId: space.gatewayPlanId,
          gatewayPriceId: space.gatewayPriceId,
        },
        { uid: space.uid },
      );
    }

    return space;
  }

  private requiresPlanUpdate(
    values: Partial<SpacesModel>,
    current?: SpacesModel,
  ): boolean {
    if (!current) {
      return true;
    }
    return typeof values.price === "number" && values.price !== current.price;
  }

  public async metrics() {
    throw new Error("Not implemented");
  }

  public async updateOne(
    values: Partial<SpacesModel>,
    where: Partial<Record<keyof SpacesModel, any>>,
  ): Promise<SpacesModel | null> {
    const current = await this.findOne(where);
    const updated = await super.update(values, where);
    const update = updated[0];
    if (!update) {
      return null;
    }
    if (this.removePayments || !this.requiresPlanUpdate(values, current)) {
      return update;
    }
    try {
      const price = await this.payment.updateSubscriptionItem(
        update,
        this.config!,
      );
      update.gatewayPriceId = price.id;
      await super.update(
        {
          gatewayPriceId: price.id,
          gatewayPlanId:
            typeof price.product === "string"
              ? price.product
              : price.product.id,
        },
        { uid: update.uid },
      );
    } catch (e) {
      console.error("Failed to update subscription item", e);
    }

    return update;
  }

  public override async destroy(
    values: Partial<SpacesModel>,
  ): Promise<SpacesModel[] | null> {
    const destroyed = await super.destroy(values);
    if (!destroyed) {
      return null;
    }

    if (this.removePayments) {
      return destroyed;
    }

    for (const plan of destroyed) {
      if (!plan.gatewayPlanId) {
        continue;
      }
      this.payment.removeSubscriptionItem(plan);
    }

    return destroyed;
  }
}

export class SpaceTagReferences extends ModelQuery<SpaceTagReference> {
  public constructor() {
    super(SpaceTagsReferenceTable);
  }
}

export class SpaceTagQuery extends ModelQuery<SpaceTags> {
  reference: SpaceTagReferences;
  public constructor() {
    super(SpaceTagsTable);
    this.reference = new SpaceTagReferences();
  }

  public async tagger(tags: UUID[], spaceUid: UUID) {
    if (!isUUID(spaceUid)) {
      throw new Error("Invalid space UID");
    }

    if (tags.length) {
      await this.reference.destroy({ space: spaceUid });
      await this.createManyReferences(tags, {
        uid: spaceUid,
      } as SpacesModel);
    } else {
      await this.reference.destroy({ space: spaceUid });
    }
  }

  public async createManyReferences(tags: UUID[], space: SpacesModel) {
    const values = tags.map((tag) => ({
      tag: tag,
      space: space.uid,
    }));
    const results = await this.db
      .insert(SpaceTagsReferenceTable)
      .values(values)
      .returning();
    return results;
  }

  public async search(
    search?: string,
    limit?: number,
    skip?: number,
  ): Promise<{ tags: SpaceTags[]; count: number }> {
    const query = this.select();

    let searchQuery = search
      ? this.where({ tag: { ilike: search } })
      : undefined;

    if (search) {
      query.where(searchQuery);
    }

    if (limit) {
      query.limit(limit);
    }

    if (skip) {
      query.offset(skip);
    }

    query.orderBy(asc(SpaceTagsTable.tag));

    const count = await this.db.$count(this.table, searchQuery);
    const tags = (await query) as SpaceTags[];

    return { count, tags };
  }
}
