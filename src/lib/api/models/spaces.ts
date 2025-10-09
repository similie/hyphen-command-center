import { type SpacesModel, type SpaceTags } from "$lib";
import { ApiModel } from "../base";
export class SpacesApi extends ApiModel<SpacesModel> {
  public constructor() {
    super("spaces");
  }

  public async all(
    tags?: string[],
    search?: string,
    skip?: number,
    limit?: number,
  ): Promise<{ spaces: SpacesModel[]; count: number }> {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (skip) {
      params.set("skip", skip.toString());
    }
    if (limit) {
      params.set("limit", limit.toString());
    }

    if (tags && tags.length) {
      params.set("tags", tags.join(","));
    }

    const response = await this.get(this.urlSet(`?${params.toString()}`));

    const results = await response.json();
    return results;
  }
}

export class SpaceTagsAPI extends ApiModel<SpaceTags> {
  public constructor() {
    super("spaces/tags");
  }

  public async all(
    search?: string,
    skip?: number,
    limit?: number,
  ): Promise<{ tags: SpaceTags[]; count: number }> {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (skip) {
      params.set("skip", skip.toString());
    }
    if (limit) {
      params.set("limit", limit.toString());
    }

    const response = await this.get(this.urlSet(`?${params.toString()}`));

    const results = await response.json();
    return results;
  }
}
