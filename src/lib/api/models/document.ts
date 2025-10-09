import {
  isUUID,
  UserRoles,
  type ApplicationDocumentModel,
  type DocumentHashModel,
  type UUID,
} from "$lib";
import { ApiModel } from "../base";

export class ApplicationDocumentApi extends ApiModel<ApplicationDocumentModel> {
  public constructor() {
    super("documents");
  }

  public async destroyMany(
    fileUids: UUID[],
  ): Promise<ApplicationDocumentModel[]> {
    const results = await this.delete(this.urlSet(`app`), {
      body: JSON.stringify({ documents: fileUids }),
    });
    return results.json();
  }

  public async findFiles(
    fileUids: UUID[],
  ): Promise<ApplicationDocumentModel[]> {
    const params = new URLSearchParams();
    let files = "";
    fileUids.forEach((uid) => {
      if (uid && isUUID(uid)) {
        files += `${uid},`;
      }
    });
    if (!files) {
      throw new Error("No valid document UIDs provided");
    }
    params.append("documents", files.slice(0, -1));
    const results = await this.get(this.urlSet(`app?${params.toString()}`));
    return results.json();
  }

  public async upload(
    filesList: File[],
    token?: string,
    role?: UserRoles,
  ): Promise<ApplicationDocumentModel[] | { error: string }> {
    const formData = new FormData();
    // Append each file to the FormData object
    for (let i = 0; i < filesList.length; i++) {
      formData.append("files", filesList[i]); // 'files' is the key, and files[i] is the value
    }

    const headers: {
      token?: string;
      "Content-Type"?: string;
      "Property-Role"?: string;
    } = {
      //   "Content-Type": "multipart/form-data",
    };

    if (token) {
      headers.token = token;
    }

    if (role !== undefined) {
      headers["Property-Role"] = role.toString();
    }
    // console.log("Uploading files with headers:", headers);
    const results = await this.post(this.urlSet("app"), {
      body: formData,
      headers,
    });

    if (results.ok) {
      return results.json();
    }
    const error = await results.text();
    return { error };
  }

  public async findHash(hash: string): Promise<DocumentHashModel | null> {
    const results = await this.get(this.urlSet(`source/hash/${hash}`));
    const res = await results.json();
    return res.hash;
  }

  public async createHash(
    hash: string,
    document: UUID,
  ): Promise<DocumentHashModel> {
    const results = await this.post(
      this.urlSet(`source/hash`),
      this.parseBody({
        hash,
        document,
      }),
    );
    return results.json();
  }
}
