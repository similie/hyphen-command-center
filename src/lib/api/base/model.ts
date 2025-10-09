import { type BaseModel, type BaseUIDModel } from "$lib/types";
import { BaseApi } from "./base-api";

export abstract class ApiModel<
  T extends BaseModel | BaseUIDModel,
> extends BaseApi {
  protected readonly modelUrl: string;
  constructor(modelUrl: string, baseUrl: string = "/api/v1", external = false) {
    super(baseUrl, true, external);
    this.modelUrl = modelUrl;
  }

  protected override urlSet(
    path: string,
    params?: Partial<
      T & { limit?: number; skip?: number; descending?: boolean }
    >,
  ): string {
    return super.urlSet(`${this.modelUrl}/${path}`, params);
  }

  public async findAll(): Promise<T[]> {
    const results = await this.get(this.urlSet(""));
    return results.json();
  }

  public async find(where: Partial<T>): Promise<T[]> {
    const results = await this.get(this.urlSet("", where));
    return results.json();
  }

  public async create(content: Partial<T>): Promise<T> {
    const results = await this.post(this.urlSet(""), this.parseBody(content));
    return results.json();
  }

  public async destroy(where: Partial<T>) {
    const results = await this.delete(this.urlSet(""), this.parseBody(where));
    return results.json();
  }

  public async update(values: Partial<T>, where: any): Promise<T> {
    const results = await this.put(
      this.urlSet(""),
      this.parseBody({
        values,
        where,
      }),
    );
    const data = await results.json();
    return Array.isArray(data) ? data.pop() : data;
  }

  public async jsonStreamer(response: Response, cb: (part: any) => void) {
    if (!response.body) {
      throw new Error("Streaming is not available");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // Buffer to accumulate incomplete JSON chunks
    // try {
    while (true) {
      // Read from the stream
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      try {
        // Split the buffer by newlines or another delimiter if JSON objects are separated by that
        const parts = buffer.split("\n").filter((part) => part.trim());
        for (const stringPart of parts) {
          const part = JSON.parse(stringPart);
          cb(part);
        }
        // Clear buffer after successful processing
        buffer = "";
      } catch (error) {
        // If parsing fails, keep accumulating buffer until a full JSON is received
        console.error("Error parsing chunk, accumulating buffer:", error);
      }
    }
  }
}
