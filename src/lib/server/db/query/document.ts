import {
  UserRoles,
  type ApplicationDocumentModel,
  type UserModel,
  type UUID,
} from "$lib/types";
import { and, eq, or } from "drizzle-orm";
import { ApplicationDocumentsTable } from "../schema";
import { ModelQuery } from "./model-query";
import sharp from "sharp";
import { isUUID } from "$lib/utils";

export class AppDocsQuery extends ModelQuery<ApplicationDocumentModel> {
  private expendableValues: (keyof ApplicationDocumentModel)[] = [
    "original_file",
    "lg_file",
    "md_file",
    "sm_file",
  ];
  constructor() {
    super(ApplicationDocumentsTable);
  }

  public terminateExpendables = (
    docs: ApplicationDocumentModel[],
  ): ApplicationDocumentModel[] => {
    return (docs as ApplicationDocumentModel[]).map(
      (d: ApplicationDocumentModel) => {
        for (const key of this.expendableValues) {
          if (d[key]) {
            delete d[key];
          }
        }
        return d;
      },
    );
  };

  public async findManyByUid(
    docs: UUID[],
    user: UserModel,
  ): Promise<ApplicationDocumentModel[]> {
    const results = await this.select().where(
      and(
        or(...docs.map((uid) => eq(ApplicationDocumentsTable.uid, uid))),
        or(
          eq(ApplicationDocumentsTable.ownerUid, user.uid),
          eq(ApplicationDocumentsTable.role, user.role),
        ),
      ),
    );

    return this.terminateExpendables(results as ApplicationDocumentModel[]);
  }

  private isImage(type: string): boolean {
    return type.startsWith("image");
  }

  private resize(file: Buffer, width: number): Promise<Buffer> {
    return sharp(file).resize({ width }).toBuffer();
  }

  private async resizeAll(file: Buffer) {
    const widths = [1200, 600, 300];
    const values = await Promise.all(
      widths.map((width) => this.resize(file, width)),
    );
    const keys = ["lg_file", "md_file", "sm_file"];
    const results: Record<string, Buffer> = {};

    for (const key of keys) {
      const buffer = values.shift();
      if (!buffer) {
        continue;
      }
      results[key] = buffer;
    }
    return results as { lg_file: Buffer; md_file: Buffer; sm_file: Buffer };
  }

  private getBufferSize(file: ApplicationDocumentModel, size: string) {
    const attr = {
      md: "md_file",
      lg: "lg_file",
      sm: "sm_file",
      "": "original_file",
    }[size] as keyof ApplicationDocumentModel;
    if (!attr) {
      throw new Error("Invalid size");
    }
    return file[attr] as Buffer;
  }

  async validRole(user: UserModel | null, uid: UUID) {
    if (!isUUID(uid)) {
      return false;
    }
    const query = `SELECT "role", "owner_uid" from "app_documents" WHERE "uid" = '${uid}'`;
    const result = await this.db.execute(query);
    if (!result || !result.length) {
      return false;
    }
    const { role, owner_uid } = result[0] as { role: number; owner_uid: UUID };

    if (owner_uid === user?.uid) {
      return true;
    }
    return role <= (user?.role || UserRoles.GUEST);
  }

  async pipeFile(uid: UUID, size: string = "") {
    const results = await this.select().where(
      eq(ApplicationDocumentsTable.uid, uid),
    );
    const file = results.pop() as ApplicationDocumentModel | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    let stream = file.original_file!;

    try {
      if (this.isImage(file.type) && size) {
        stream = this.getBufferSize(file, size);
      }
    } catch (error) {
      console.error(error);
    }
    // Convert Buffer -> Uint8Array (BodyInit)
    const body = new Uint8Array(stream);
    return new Response(body, {
      headers: {
        "Content-Type": "application/octet-stream", // Adjust the MIME type as needed
        "Content-Disposition": `attachment; ${file.name}`, // Adjust for file download
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: uid,
      },
    });
  }

  private alterName(name: string) {
    if (name.length < 128) {
      return name;
    }
    const split = name.split(".");
    split[0] = split[0].substring(0, 127 - split[split.length - 1].length);
    return split.length === 2 ? split.join(".") : split[0] + "." + split[1];
  }

  async buildFile(
    files: FormDataEntryValue[],
    ownerUid?: UUID,
    role?: UserRoles,
  ): Promise<ApplicationDocumentModel[]> {
    const filesHold: ApplicationDocumentModel[] = [];
    for (const file of files as File[]) {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      let forCreation: Partial<ApplicationDocumentModel> = {
        size: file.size,
        name: this.alterName(file.name),
        type: file.type,
        ownerUid,
        role,
      };
      // Convert the ArrayBuffer to a Buffer (Node.js)
      const buffer = Buffer.from(arrayBuffer);
      forCreation.original_file = buffer;
      try {
        if (this.isImage(file.type)) {
          const results = await this.resizeAll(buffer);
          forCreation = { ...forCreation, ...results };
        }
      } catch (e) {
        console.error("Image resizing error", e);
      }

      const created = await this.createOne(forCreation);
      if (!created) {
        continue;
      }

      filesHold.push(created);
    }

    return this.terminateExpendables(filesHold);
  }
}
