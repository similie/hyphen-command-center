import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { db } from "./db.server";
import type { BaseModel, BaseUIDModel } from "$lib/types";
import {
  and,
  eq,
  gt,
  gte,
  lt,
  lte,
  sql,
  or,
  getTableColumns,
  ilike,
  like,
  between,
} from "drizzle-orm";

export class ModelQuery<T extends BaseModel | BaseUIDModel> {
  protected db: PostgresJsDatabase<Record<string, never>>;
  constructor(protected table: PgTableWithColumns<any>) {
    // table: increase scope to protected??
    this.db = db;
  }

  public convertTableValues<T extends BaseModel | BaseUIDModel>(
    values: any,
    table: PgTableWithColumns<any>,
  ): T | T[] {
    const isArray = Array.isArray(values);

    const store: T[] = [];
    const columns = getTableColumns(table);
    const rows = [...(isArray ? values : [values])];
    for (const row of rows) {
      const value: T = { ...row };
      for (const col in columns) {
        const name = columns[col].name as keyof T;
        value[col as keyof T] = row[name];
      }
      store.push(value);
    }
    return isArray ? store : store[0];
  }

  private omitBase(values: Partial<T>) {
    const send = {
      ...values,
    };
    const omit = ["id", "uid", "created_at", "updated_at"];
    for (const key of omit) {
      delete send[key as keyof T];
    }
    return send;
  }

  public snakeToCamelCase(obj: Record<string, any>) {
    const omit = ["id", "uid", "created_at", "updated_at"];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (omit.includes(key)) {
          continue;
        }
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        if (newKey !== key) {
          obj[newKey] = obj[key];
          delete obj[key];
        }
      }
    }
    return obj;
  }

  public select() {
    return this.db.select().from(this.table);
  }

  public allSelect() {
    return this.select();
  }

  public async findOne(where: Partial<Record<keyof T, any>>) {
    const found = await this.find(where);
    if (found.length > 1) {
      throw new Error("The query did not select a unique value");
    }
    return found.pop();
  }

  public find(where: Partial<Record<keyof T, any>>): Promise<T[]> {
    return this.select().where(this.where(where));
  }

  public async count(where: Partial<Record<keyof T, any>>) {
    const count = this.db.$count(this.table, this.where(where));
    const values = await count;
    return values;
  }

  public async countAll() {
    const count = this.db.$count(this.table);
    const values = await count;
    return values;
  }

  public async createOne(values: Partial<T>): Promise<T | null> {
    const insert = await this.insert(values);
    const value = insert.pop();
    if (!value) {
      return null;
    }
    return value as unknown as T;
  }

  public insert(values: Partial<T>) {
    return this.db.insert(this.table).values(values).returning();
  }

  public insertMany(values: Partial<T>[]): Promise<T[]> {
    return this.db
      .insert(this.table)
      .values(values)
      .returning() as unknown as Promise<T[]>;
  }

  public update(
    values: Partial<T>,
    where: Partial<Record<keyof T, any>>,
  ): Promise<T[]> {
    return this.db
      .update(this.table)
      .set(this.omitBase(values))
      .where(this.where(where))
      .returning() as unknown as Promise<T[]>;
  }

  public destroy(values: Partial<T>) {
    return this.db
      .delete(this.table)
      .where(this.where(values))
      .returning() as unknown as Promise<T[] | null>;
  }

  public executeRaw(query: string) {
    return this.db.execute(sql.raw(query));
  }

  public where(values: Partial<Record<keyof T, any>>) {
    const whereClauses = Object.entries(values).map(([key, value]) => {
      if (value && Array.isArray(value)) {
        return or(...value.map((m) => eq(this.table[key], m)));
      } else if (value && typeof value === "object") {
        const column = values[key as keyof T];
        const [operator, val] = Object.entries(column)[0];
        switch (operator) {
          case "gt":
            return gt(this.table[key], val);
          case "lt":
            return lt(this.table[key], val);
          case "gte":
            return gte(this.table[key], val);
          case "lte":
            return lte(this.table[key], val);
          case "like":
            return like(this.table[key], `%${val}%`);
          case "ilike":
            return ilike(this.table[key], `%${val}%`);
          case "between":
            const { start, end } = val as { start: any; end: any };
            if (!val || !start || !end) {
              throw new Error("Invalid 'between' query");
            }
            return between(this.table[key], start, end);
          // Add more operators as needed
          default:
            throw new Error(`Unsupported operator: ${operator}`);
        }
      }
      return eq(this.table[key], value);
    });

    return and(...whereClauses);
  }
}
