import { PaymentService } from "$lib/server/utils/payments";
import type { SpacesModel, SiteConfig, UserModel } from "$lib/types";
import Stripe from "stripe";
export interface PaymentServiceOptions {
  /** Your Stripe secret key *
  /** Mapping of plan names to Stripe Price IDs */
  /** URLs to redirect after checkout */
  successUrl: string;
  cancelUrl: string;
}

export class StripePaymentService extends PaymentService {
  private stripe: Stripe;
  //   private readonly _pq: SystemPlansQuery;
  private readonly options: PaymentServiceOptions = {
    successUrl: process.env.STRIPE_SUCCESS_URL || "",
    cancelUrl: process.env.STRIPE_CANCEL_URL || "",
  };
  constructor() {
    super();
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not set");
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil",
    });

    // this._pq = new SystemPlansQuery();
  }

  /**
   * Create or fetch a Stripe Customer for a given email
   */
  public override async createCustomer(
    email: string,
    metadata?: Record<string, string>,
  ) {
    const customers = await this.stripe.customers.list({ email, limit: 1 });
    if (customers.data.length) return customers.data[0];
    return this.stripe.customers.create({ email, metadata });
  }

  /**
   * Ensure a Stripe Product exists for this plan, creating it if needed
   */
  private async ensureProduct(plan: SpacesModel): Promise<Stripe.Product> {
    try {
      if (plan.gatewayPlanId) {
        return await this.stripe.products.retrieve(plan.gatewayPlanId);
      }
    } catch (e) {
      console.error("Failed to retrieve product", e);
    }
    // If the product doesn't exist, create it
    const product = await this.stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { planId: plan.uid },
    });
    plan.gatewayPlanId = product.id;
    return product;
  }

  /**
   * Create a subscription for a customer on a paid plan
   */
  public override async createSubscription(
    user: UserModel,
    plan: SpacesModel,
  ): Promise<Stripe.Subscription> {
    const customer = await this.createCustomer(user.email, { uid: user.uid });
    return this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.gatewayPlanId }],
      expand: ["latest_invoice.payment_intent"],
    });
  }

  public static billingAnchorAtSignup(signUpDate: Date = new Date()): number {
    // Create a Date at UTC midnight on the signup day:
    const anchorDate = new Date(
      Date.UTC(
        signUpDate.getUTCFullYear(),
        signUpDate.getUTCMonth(),
        signUpDate.getUTCDate(), // day of month
        0,
        0,
        0,
      ),
    );
    // Convert to seconds (Stripe’s format)
    return Math.floor(anchorDate.getTime() / 1000);
  }

  public override async changePlan(
    subscriptionId: string,
    newPlan: SpacesModel,
  ): Promise<Stripe.Subscription> {
    if (!newPlan.gatewayPriceId) {
      throw new Error("Plan does not have a Stripe Price ID");
    }
    // 1. Retrieve the subscription (to get the item ID)
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
    );

    // 2. Extract the first subscription item’s ID
    const currentItemId = subscription.items.data[0].id;
    // const product = await this.ensureProduct(newPlan);
    // 3. Update in place: swap to the new price
    return this.stripe.subscriptions.update(subscriptionId, {
      // Replace the item with the new plan price
      items: [
        {
          id: currentItemId,
          price: newPlan.gatewayPriceId!,
        },
      ],
      // Control proration:
      // - 'create_prorations' will charge (or credit) for mid-cycle change
      // - 'none' will apply new price next billing period with no proration
      proration_behavior: "create_prorations",
    });
  }
  /**
   * Create a new Stripe Price (subscription item) for an API plan
   * Saves the generated Price ID on plan.gatewayPriceId
   */
  public override async createSubscriptionItem(
    plan: SpacesModel,
    config: SiteConfig,
  ): Promise<Stripe.Response<Stripe.Price>> {
    const product = await this.ensureProduct(plan);
    const price = await this.stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100),
      currency: (config.currency ?? "usd").toLocaleLowerCase(),
      recurring: { interval: "month" },
      metadata: { planId: plan.uid },
    });
    plan.gatewayPriceId = price.id;

    return price;
  }

  /**
   * Removes an existing Stripe Price by deactivating the old one and creating a new Price
   * Returns the new Price and updates plan.gatewayPriceId
   */
  public override async removeSubscriptionItem(
    plan: SpacesModel,
  ): Promise<Stripe.Price> {
    // Deactivate the old price
    return this.stripe.prices.update(plan.gatewayPlanId, { active: false });
  }

  /**
   * Update an existing Stripe Price by deactivating the old one and creating a new Price
   * Returns the new Price and updates plan.gatewayPriceId
   */
  public override async updateSubscriptionItem(
    plan: SpacesModel,
    config: SiteConfig,
  ): Promise<Stripe.Price> {
    if (!plan.gatewayPlanId) {
      // No existing price: just create a new one
      return this.createSubscriptionItem(plan, config);
    }

    // Deactivate the old price
    try {
      await this.removeSubscriptionItem(plan);
    } catch (e) {
      console.error("Failed to remove subscription item", e);
    }

    // Create a new price with the updated amount
    const newPrice = await this.createSubscriptionItem(plan, config);
    return newPrice;

    // ... other PaymentService methods (customers, subscriptions, webhooks) remain unchanged ...
  }

  /**
   * Create a Stripe Checkout Session for a paid plan
   */
  public override async createCheckoutSession(
    user: UserModel,
    plan: SpacesModel,
  ): Promise<Stripe.Checkout.Session> {
    if (!plan.gatewayPlanId) {
      throw new Error("Plan does not have a Stripe Price ID");
    }
    const customer = await this.createCustomer(user.email, { uid: user.uid });
    console.log("Creating checkout session for customer:", customer);
    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: plan.gatewayPriceId, quantity: 1 }],
      customer_email: customer.email || user.email,
      success_url: this.options.successUrl,
      cancel_url: this.options.cancelUrl,
    });
  }

  /**
   * Cancel an existing subscription at period end
   */
  public override async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  public override async cancelSubscriptionNow(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId, {
      prorate: true,
      invoice_now: true,
    });
  }

  public override async pullSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  public async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
  }

  /**
   * Handle incoming Stripe webhook events
   */
  handleWebhook(
    payload: Buffer,
    sigHeader: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      sigHeader,
      webhookSecret,
    );
  }
}
