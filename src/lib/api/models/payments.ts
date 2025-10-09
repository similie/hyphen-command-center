import { isUUID, type BaseUIDModel, type UUID } from "$lib";
import { ApiModel } from "../base";
export class PaymentsApi extends ApiModel<BaseUIDModel> {
  public constructor() {
    super("payments", undefined, true);
  }

  async resumeCheckout<T>(key: UUID): Promise<T> {
    if (!isUUID(key)) {
      throw new Error("Invalid Input");
    }
    const results = await this.post(this.urlSet(`resume`), {
      headers: { "content-type": "application/json" },
      ...this.parseBody({ key }),
    });
    if (results.status !== 200) {
      if (results.headers.get("content-type") !== "application/json") {
        const text = await results.text();
        console.error("RESUME CHECKOUT RESPONSE ", text);
      }
      throw new Error(`Failed to create checkout session: ${results.status}`);
    }
    const result = await results.json();

    return result;
  }

  async checkout<T>(key: Partial<T>): Promise<T> {
    const results = await this.post(this.urlSet(`checkout`), {
      headers: { "content-type": "application/json" },
      ...this.parseBody(key),
    });
    if (results.status !== 200) {
      if (results.headers.get("content-type") !== "application/json") {
        const text = await results.text();
        console.error("CHECKOUT RESPONSE ", text);
      }
      throw new Error(`Failed to create checkout session: ${results.status}`);
    }
    const result = await results.json();

    return result;
  }
}
