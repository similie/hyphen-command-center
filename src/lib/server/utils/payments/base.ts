import type { SpacesModel, SiteConfig, UserModel } from "$lib/types";
import { t } from "svelte-i18n";

export class PaymentService {
  // Payment processing logic goes here
  /**
   * Create or fetch a Stripe Customer for a given email
   */
  public async createCustomer(
    email: string,
    metadata?: Record<string, string>,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async createSubscription(
    user: UserModel,
    plan: SpacesModel,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async changePlan(
    subscriptionId: string,
    newPlan: SpacesModel,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
  /**
   * Create a new Stripe Price (subscription item) for an API plan
   * Saves the generated Price ID on plan.gatewayPriceId
   */
  public async createSubscriptionItem(
    plan: SpacesModel,
    config: SiteConfig,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * Removes an existing Stripe Price by deactivating the old one and creating a new Price
   * Returns the new Price and updates plan.gatewayPriceId
   */
  public async removeSubscriptionItem(plan: SpacesModel): Promise<any> {
    // Deactivate the old price
    throw new Error("Method not implemented.");
  }

  /**
   * Update an existing Stripe Price by deactivating the old one and creating a new Price
   * Returns the new Price and updates plan.gatewayPriceId
   */
  public async updateSubscriptionItem(
    plan: SpacesModel,
    config: SiteConfig,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * Create a Stripe Checkout Session for a paid plan
   */
  public async createCheckoutSession(
    user: UserModel,
    plan: SpacesModel,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * Cancel an existing subscription at period end
   */
  public async cancelSubscription(subscriptionId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async cancelSubscriptionNow(subscriptionId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async pullSubscription(subscriptionId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
