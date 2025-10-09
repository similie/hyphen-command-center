// src/lib/server/ShoppingCart.ts
import type { RequestEvent } from "@sveltejs/kit";
import { RedisCache } from "$lib/server";
import { CourseRegistrationQuery, ProductsQuery } from "$lib/server/db/query";
import type {
  CartItem,
  CartSnapshot,
  CourseRegistrationCart,
  UUID,
  CourseWithRegistration,
  ProductsModel,
} from "$lib/types";

export class ShoppingCart {
  // Redis key space
  private static CART_KEY = (id: UUID) => `cart:${id}`;
  private static USER_INDEX_KEY = (userId: string) => `usercart:${userId}`;
  private static PRODUCTS_INDEX_KEY = (sku: string) => `productcart:${sku}`;
  private static COURSE_INDEX_KEY = (courseId: string) =>
    `coursecart:${courseId}`;
  // Cookies
  private static CART_COOKIE = "sc_cart";
  private static CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

  // Redis TTL (keep in sync with cookie)
  private static CART_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

  // ---- Factory / bootstrapping ---------------------------------------------

  /**
   * Get or create a cart bound to either:
   *  - cookie cart id (anonymous), and/or
   *  - userId mapping (if session user present)
   *
   * It also sets/updates the cookie as needed and merges carts when
   * cookie cart ≠ user-mapped cart.
   */
  static async findCourseInCache(
    courseID: string,
  ): Promise<CourseWithRegistration | null> {
    const result = await RedisCache.get<CourseWithRegistration>(
      this.COURSE_INDEX_KEY(courseID),
    );
    if (result) {
      return result;
    }
    const query = new CourseRegistrationQuery();
    const course = await query.pullCurrent(courseID as UUID);
    if (!course) {
      return null;
    }
    await this.addCourseToCache(course);

    return course;
  }
  static async findProductInCache(
    productID: string,
  ): Promise<ProductsModel | null> {
    const result = await RedisCache.get<ProductsModel>(
      this.PRODUCTS_INDEX_KEY(productID),
    );
    if (result) {
      return result;
    }
    const query = new ProductsQuery();
    const product = await query.findOne({ sku: productID });
    if (!product) {
      return null;
    }
    await this.addProductToCache(product);
    return product;
  }

  static async addProductToCache(product: ProductsModel) {
    await RedisCache.set(
      this.COURSE_INDEX_KEY(product.sku),
      product,
      this.CART_TTL_SECONDS,
    );
  }

  static async addCourseToCache(course: CourseWithRegistration) {
    await RedisCache.set(
      this.COURSE_INDEX_KEY(course.uid),
      course,
      this.CART_TTL_SECONDS,
    );
  }

  static async clearCart(event: RequestEvent, userMappedId: UUID | null) {
    const cart = await this.getOrCreate(event, userMappedId);
    await cart.purge();
  }

  static async getActiveCartId(event: RequestEvent, userMappedId: UUID | null) {
    const cookieId = (event.cookies.get(this.CART_COOKIE) as UUID) ?? null;

    // console.log("User Mapped ID:", userMappedId);
    // console.log("Cookie ID:", cookieId);

    let activeCartId: UUID | null = null;

    if (userMappedId && cookieId && userMappedId !== cookieId) {
      // Two carts exist — merge them, prefer the user-mapped id as primary
      await this.mergeCarts(userMappedId, cookieId);
      activeCartId = userMappedId;
      // Optional: delete the old cookie cart after merge (mergeCarts already purges the secondary)
    } else if (userMappedId) {
      activeCartId = userMappedId;
    } else if (cookieId) {
      activeCartId = cookieId;
    } else {
      activeCartId = crypto.randomUUID();
    }
    return activeCartId;
  }

  static cookieOpt(event: RequestEvent) {
    const secure = event.url.protocol === "https:";
    return {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure,
      maxAge: 0,
    };
  }

  static unsetCookie(event: RequestEvent) {
    event.cookies.delete(this.CART_COOKIE, this.cookieOpt(event));
  }

  static async getOrCreate(
    event: RequestEvent,
    sessionUserId?: string | UUID | null,
  ) {
    const userId = sessionUserId ?? null;

    // // May be undefined if no cookie yet
    // const cookieId = (event.cookies.get(this.CART_COOKIE) as UUID) ?? null;
    // console.log("WHERE IS MY COOKIE GOING", cookieId, userId);
    const userMappedId = userId
      ? await RedisCache.get<UUID | null>(this.USER_INDEX_KEY(userId))
      : null;

    // console.log("User Mapped ID:", userId, userMappedId);
    // console.log("Cookie ID:", cookieId);

    let activeCartId = await this.getActiveCartId(event, userMappedId);
    // Ensure a cart record exists
    let cart = await this.load(activeCartId);
    if (!cart) {
      cart = this.newCart(activeCartId, userId);
      await this.save(cart);
    }

    // If user present and no mapping or mapping mismatched, (re)bind it
    if (userId && userMappedId !== activeCartId) {
      await RedisCache.set(
        this.USER_INDEX_KEY(userId),
        activeCartId,
        this.CART_TTL_SECONDS,
      );
      // If the cart didn't have a user yet, annotate it
      if (!cart.userId) {
        cart.userId = userId;
        await this.save(cart);
      }
    }

    // Ensure cookie is set to active cart id
    this.setCartCookie(event, activeCartId);

    return new ShoppingCart(cart, event);
  }

  static async getCartWithItems(
    event: RequestEvent,
    sessionUserId?: string | UUID | null,
  ): Promise<CourseRegistrationCart> {
    const cart = await this.getOrCreate(event, sessionUserId);
    const items = cart.items || [];
    let courses = [];
    let products = [];
    for (const { sku, session, course } of items) {
      if (!sku) {
        continue;
      }

      if (course) {
        const course = await this.findCourseInCache(sku as UUID);
        if (!course) {
          continue;
        }
        course.selectedSession = session;
        courses.push(course);
      } else {
        const product = await this.findProductInCache(sku as UUID);
        if (!product) {
          continue;
        }
        products.push(product);
      }
    }

    return { cart: items, courses, products };
  }

  // ---- Instance -------------------------------------------------------------

  private constructor(
    private snapshot: CartSnapshot,
    private event: RequestEvent,
  ) {}

  get id() {
    return this.snapshot.id;
  }

  get userId() {
    return this.snapshot.userId ?? null;
  }

  get items(): CartItem[] {
    return [...this.snapshot.items];
  }

  toJSON(): CartSnapshot {
    return { ...this.snapshot, items: [...this.snapshot.items] };
  }

  // ---- Mutations ------------------------------------------------------------

  async addItem(item: CartItem) {
    const idx = this.snapshot.items.findIndex((i) => i.sku === item.sku);
    if (idx >= 0) {
      this.snapshot.items[idx].qty += item.qty;
      if (item.price !== undefined) this.snapshot.items[idx].price = item.price;
      if (item.meta)
        this.snapshot.items[idx].meta = {
          ...this.snapshot.items[idx].meta,
          ...item.meta,
        };
    } else {
      this.snapshot.items.push({ ...item });
    }
    await this.touchAndSave();
  }

  async setItemQty(sku: string, qty: number) {
    const idx = this.snapshot.items.findIndex((i) => i.sku === sku);
    if (idx < 0) return;
    if (qty <= 0) {
      this.snapshot.items.splice(idx, 1);
    } else {
      this.snapshot.items[idx].qty = qty;
    }
    await this.touchAndSave();
  }

  async removeItem(sku: string) {
    this.snapshot.items = this.snapshot.items.filter((i) => i.sku !== sku);
    await this.touchAndSave();
  }

  async clear() {
    this.snapshot.items = [];
    await this.touchAndSave();
  }

  /**
   * Purge the cart entirely (e.g., after successful checkout).
   * Removes Redis cart, user mapping, and clears the cookie.
   */
  async purge() {
    await RedisCache.del(ShoppingCart.CART_KEY(this.snapshot.id));
    if (this.snapshot.userId) {
      // Remove mapping only if it points to this cart id
      const key = ShoppingCart.USER_INDEX_KEY(this.snapshot.userId);
      const mapped = await RedisCache.get<UUID | null>(key);
      if (mapped === this.snapshot.id) {
        await RedisCache.del(key);
      }
    }
    this.clearCartCookie(this.event);
  }

  // ---- Internals ------------------------------------------------------------

  private static newCart(id: UUID, userId?: string | null): CartSnapshot {
    const now = new Date().toISOString();
    return {
      id,
      userId: userId ?? null,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private static async load(id: UUID): Promise<CartSnapshot | null> {
    return await RedisCache.get<CartSnapshot>(this.CART_KEY(id));
  }

  private static async save(cart: CartSnapshot): Promise<void> {
    await RedisCache.set(this.CART_KEY(cart.id), cart, this.CART_TTL_SECONDS);
    if (cart.userId) {
      await RedisCache.set(
        this.USER_INDEX_KEY(cart.userId),
        cart.id,
        this.CART_TTL_SECONDS,
      );
    }
  }

  private async touchAndSave() {
    this.snapshot.updatedAt = new Date().toISOString();
    await ShoppingCart.save(this.snapshot);
  }

  private static async mergeCarts(primaryId: UUID, secondaryId: UUID) {
    const [primary, secondary] = await Promise.all([
      this.load(primaryId),
      this.load(secondaryId),
    ]);

    const base = primary ?? this.newCart(primaryId);
    const extra = secondary ?? null;

    if (extra && extra.items.length) {
      for (const item of extra.items) {
        const idx = base.items.findIndex((i) => i.sku === item.sku);
        if (idx >= 0) {
          base.items[idx].qty += item.qty;
          if (item.price !== undefined) base.items[idx].price = item.price;
          if (item.meta)
            base.items[idx].meta = { ...base.items[idx].meta, ...item.meta };
        } else {
          base.items.push({ ...item });
        }
      }
    }

    base.updatedAt = new Date().toISOString();
    await this.save(base);

    // Purge secondary cart after merge
    await RedisCache.del(this.CART_KEY(secondaryId));
  }

  private static setCartCookie(event: RequestEvent, cartId: UUID) {
    event.cookies.set(this.CART_COOKIE, cartId, {
      ...ShoppingCart.cookieOpt(event),
      maxAge: this.CART_COOKIE_MAX_AGE_SECONDS,
    });
  }

  private clearCartCookie(event: RequestEvent) {
    const secure = event.url.protocol === "https:";
    event.cookies.set(
      ShoppingCart.CART_COOKIE,
      "",
      ShoppingCart.cookieOpt(event),
    );
  }
}
