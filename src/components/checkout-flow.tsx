"use client";

import type {
  QuickCheckoutResult,
  QuickShippingQuote,
} from "@quickengine/quick/browser";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  forgetPartnerDiscount,
  partnerCode,
  partnerDiscountCode,
} from "@/lib/partner-link";
import { quickDashClient } from "@/lib/quickdash";
import { useCart } from "./cart-store";
import { useCatalog } from "./catalog-store";
import { useCustomerAuth } from "./customer-auth-store";
import { StripePaymentElement } from "./stripe-payment-element";
import { useToast } from "./toast-store";
import { useAppliedDiscount } from "./use-applied-discount";

const steps = [
  "ACCESS",
  "CONTACT",
  "DELIVERY",
  "SHIPPING",
  "PAYMENT",
  "REVIEW",
] as const;
type Step = (typeof steps)[number];

type StripeCheckout = {
  clientSecret: string;
  order: QuickCheckoutResult["order"];
  providerAccountId: string;
};

type CheckoutData = {
  address: string;
  city: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  province: string;
  shippingRateId: string;
};

const initialData: CheckoutData = {
  address: "",
  city: "",
  country: "CA",
  email: "",
  firstName: "",
  lastName: "",
  postalCode: "",
  province: "",
  shippingRateId: "",
};

const money = (cents: number) => (cents / 100).toFixed(2);

/**
 * The only provinces this shop delivers to, as ISO 3166-2 region codes.
 *
 * 🔴 QuickDash quotes against the CODE, and its validator caps a region at six
 * characters — so a shopper typing "Alberta", which is what a shopper actually
 * types, got a 400 from `/v1/shipping/quote` and could not check out at all.
 * A list shows the name and submits the code, which makes the wrong answer
 * unreachable instead of merely discouraged.
 */
const CA_PROVINCES = [
  { code: "AB", name: "ALBERTA" },
  { code: "BC", name: "BRITISH COLUMBIA" },
  { code: "MB", name: "MANITOBA" },
  { code: "NB", name: "NEW BRUNSWICK" },
  { code: "NL", name: "NEWFOUNDLAND AND LABRADOR" },
  { code: "NS", name: "NOVA SCOTIA" },
  { code: "NT", name: "NORTHWEST TERRITORIES" },
  { code: "NU", name: "NUNAVUT" },
  { code: "ON", name: "ONTARIO" },
  { code: "PE", name: "PRINCE EDWARD ISLAND" },
  { code: "QC", name: "QUEBEC" },
  { code: "SK", name: "SASKATCHEWAN" },
  { code: "YT", name: "YUKON" },
] as const;

export function CheckoutFlow() {
  const { clear, items } = useCart();
  // Read once on mount: a cookie written by the partner-link route.
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  /**
   * Buying a standing order rather than a basket.
   *
   * 🔑 `/checkout?plan=<id>` from the subscribe page. The plan already says what
   * is in the box, so the basket is not sent at all — the server refuses both
   * together, because a plan's price against a basket's contents is how somebody
   * ends up charged for the wrong thing.
   */
  const [planId, setPlanId] = useState<string | null>(null);
  /**
   * What the chosen plan actually contains.
   *
   * 🔴 Needed to quote SHIPPING. A subscription checkout sends no items — the
   * plan already knows what it holds — but a parcel still has to be priced to
   * an address, and the shipping quote is priced from items.
   *
   * Without this the subscribe flow could never reach a shipping option, and
   * the submit guard below refuses to place an order without one. The plan
   * branch was written, correct, and unreachable.
   */
  const [planItems, setPlanItems] = useState<
    Array<{ catalogItemId: string; quantity: number }>
  >([]);
  /**
   * 🔑 ON MOUNT ONLY, and that is the whole point.
   *
   * It reads a cookie a partner link left, validates that code against the cart
   * as it stands, and reads the chosen plan out of the address. Depending on
   * `availableItems` would re-run all of it on every cart edit: an API call per
   * keystroke on a quantity box, and — worse — a discount the shopper
   * deliberately removed quietly reinstated the moment they change anything.
   *
   * ⚠️ The suppression is ONE line on purpose. Wrapped across two, biome
   * attaches it to the comment underneath rather than to the hook, reports it as
   * unused, and fails the build while looking entirely correct.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; re-running on cart changes would re-apply a discount the shopper removed and call the API on every edit.
  useEffect(() => {
    /**
     * 🔴 Checked before it is trusted.
     *
     * This code came from a cookie a partner link set, not from anything the
     * shopper typed. If it is dead, sending it makes the API refuse the whole
     * order — and the shopper sees "that code isn't recognised" for a code they
     * never entered and cannot find anywhere on screen to remove.
     *
     * So: try it, and if the API will not take it, forget it and let the order
     * through at full price. A lost discount is a bad afternoon for marketing.
     * A lost sale is worse, and it is silent.
     */
    const linkDiscount = partnerDiscountCode();
    if (linkDiscount) {
      void (async () => {
        try {
          const { data } = await quickDashClient().site.previewDiscount({
            code: linkDiscount,
            items: availableItems.map((item) => ({
              catalogItemId: item.catalogItemId,
              quantity: item.quantity,
            })),
          });
          if (data.valid) setDiscountCode(linkDiscount);
          else forgetPartnerDiscount();
        } catch {
          // Cannot tell whether it is good. Do not gamble the order on it.
          forgetPartnerDiscount();
        }
      })();
    }
    setReferralCode(partnerCode());
    const chosen = new URLSearchParams(window.location.search).get("plan");
    setPlanId(chosen);
    if (!chosen) return;
    /**
     * The plan's own contents, so a subscription can be shipped somewhere.
     *
     * ⚠️ A direct call rather than an SDK method, matching `subscription-plans`.
     * The INSTALLED Quick.js package predates `listSubscriptionPlans` — this
     * storefront depends on a published version, not the monorepo source. Swap
     * both to the SDK method once the release carrying it is installed.
     */
    void (async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_QUICKDASH_API_URL}/v1/subscription-plans`,
          {
            headers: {
              "QuickEngine-Workspace":
                process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID ?? "",
              "QuickEngine-Publishable-Key":
                process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY ?? "",
            },
          },
        );
        if (!response.ok) return;
        const body = (await response.json()) as {
          data?: {
            items?: Array<{
              id: string;
              items?: Array<{ catalogItemId: string; quantity: number }>;
            }>;
          };
        };
        const plan = body.data?.items?.find((entry) => entry.id === chosen);
        setPlanItems(
          (plan?.items ?? []).map((item) => ({
            catalogItemId: item.catalogItemId,
            quantity: item.quantity,
          })),
        );
      } catch {
        // A plan whose contents cannot be read still checks out; it simply
        // cannot be shipped, and the shipping step says so rather than failing
        // silently at submit.
      }
    })();
  }, []);
  const {
    availabilityFor,
    findProductById,
    loading: catalogLoading,
    products,
  } = useCatalog();

  /**
   * What this basket is priced in.
   *
   * 🔴 Read from the catalog, never written into the markup. Every total on
   * this page used to end in a literal "CAD", so the day this shop sells to
   * anybody outside Canada the checkout would confidently label a US-dollar
   * total as Canadian — a customer being told the wrong currency at the moment
   * they authorise a payment.
   *
   * ⚠️ Falls back to the first product's currency, then to CAD, because a
   * currency has to say SOMETHING and an empty string beside a number is worse
   * than a wrong guess nobody can act on. A workspace sells in one currency
   * today; when that stops being true this becomes the order's currency.
   */
  const currency = products[0]?.currency ?? "CAD";
  const { session } = useCustomerAuth();
  const { pushToast } = useToast();
  const [step, setStep] = useState<Step>("ACCESS");
  const [data, setData] = useState<CheckoutData>(initialData);
  const [shippingQuote, setShippingQuote] = useState<QuickShippingQuote | null>(
    null,
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [stripeCheckout, setStripeCheckout] = useState<StripeCheckout | null>(
    null,
  );
  const [completedOrder, setCompletedOrder] = useState<
    QuickCheckoutResult["order"] | null
  >(null);
  const checkoutAttempt = useRef<string | null>(null);
  const availableItems = items.flatMap((item) => {
    const product = findProductById(item.catalogItemId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = availableItems.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const shippingOption = shippingQuote?.options.find(
    (option) => option.rateId === data.shippingRateId,
  );
  const shipping = shippingOption?.amountCents ?? 0;
  /**
   * The same server-priced saving the basket already shows.
   *
   * 🔴 Checkout priced its own subtotal and ignored the discount entirely, so a
   * basket reading $20.40 became a checkout reading $24.00 — while the code was
   * still sent to the server, which charged the lower figure. Every number a
   * shopper saw between the basket and the receipt was wrong, and the one place
   * that mattered contradicted the two around it.
   *
   * ⚠️ Priced by `/v1/discounts/preview`, never here. The browser computing a
   * saving is how a client talks itself into a discount it has not earned.
   */
  const appliedDiscount = useAppliedDiscount(availableItems);
  const discount = appliedDiscount?.amountCents ?? 0;
  const total = Math.max(0, subtotal - discount) + shipping;
  const currentStep = steps.indexOf(step);
  const inventoryBlocked = availableItems.some((item) => {
    const availability = availabilityFor(item.catalogItemId);
    return (
      availability?.available === false ||
      (availability?.tracked === true &&
        availability.availableQuantity !== null &&
        item.quantity > availability.availableQuantity)
    );
  });

  if (catalogLoading) {
    return (
      <section className="empty-state">
        <p>STATUS / VERIFYING_ORDER</p>
        <h2>CHECKING LIVE CATALOG.</h2>
      </section>
    );
  }

  const updateFromForm = (event: FormEvent<HTMLFormElement>, next: Step) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setData(
      (current) =>
        ({
          ...current,
          ...Object.fromEntries(formData.entries()),
        }) as CheckoutData,
    );
    setStep(next);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const quoteShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextData = {
      ...data,
      ...Object.fromEntries(formData.entries()),
    } as CheckoutData;
    setData(nextData);
    setShippingLoading(true);
    try {
      const { data: quote } = await quickDashClient().site.quoteShipping({
        // ⚠️ A subscription has no cart. Its parcel is the plan's contents, and
        // it still has to be delivered to an address like anything else.
        items: planId
          ? planItems
          : availableItems.map((item) => ({
              catalogItemId: item.catalogItemId,
              quantity: item.quantity,
            })),
        destination: {
          countryCode: nextData.country,
          regionCode: nextData.province,
          postalCode: nextData.postalCode,
        },
      });
      if (quote.options.length === 0) {
        throw new Error("No shipping route is available for this address.");
      }
      setShippingQuote(quote);
      setData((current) => ({
        ...current,
        shippingRateId: quote.options[0].rateId,
      }));
      setStep("SHIPPING");
      window.scrollTo({ behavior: "smooth", top: 0 });
    } catch (error) {
      pushToast({
        code: "SHIP_ERR",
        message:
          error instanceof Error
            ? error.message.toUpperCase()
            : "QUICKDASH COULD NOT QUOTE SHIPPING.",
        tone: "error",
      });
    } finally {
      setShippingLoading(false);
    }
  };

  const startPayment = async () => {
    if (!shippingOption || submittingOrder) return;
    setSubmittingOrder(true);
    try {
      checkoutAttempt.current ??= crypto.randomUUID();
      const { data: checkout } = await quickDashClient().site.checkout(
        /**
         * ⚠️ Cast because the INSTALLED Quick.js package still requires `items`
         * and does not know `subscriptionPlanId`. The API accepts exactly one of
         * the two and refuses both. Remove once the SDK release carrying the
         * optional basket is installed.
         */
        {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`.trim(),
          // One or the other, never both.
          ...(planId
            ? { subscriptionPlanId: planId }
            : {
                items: availableItems.map((item) => ({
                  catalogItemId: item.catalogItemId,
                  quantity: item.quantity,
                })),
              }),
          shippingRateId: shippingOption.rateId,
          /**
           * A code typed into the basket wins over one carried by a link.
           *
           * Somebody who has deliberately entered a code expects THAT code to
           * apply; silently overriding it with one from a link they followed
           * weeks ago is the kind of thing people notice only after paying.
           */
          ...(discountCode ? { discountCode } : {}),
          /**
           * Who gets the credit. Separate from the discount because the two
           * halves of a partner arrangement are independent: a link can
           * attribute an order without taking anything off it, and a code typed
           * into the basket discounts without crediting anybody.
           */
          ...(referralCode ? { referralCode } : {}),
          shippingAddress: {
            name: `${data.firstName} ${data.lastName}`.trim(),
            line1: data.address,
            city: data.city,
            region: data.province,
            postalCode: data.postalCode,
            countryCode: data.country,
          },
        } as Parameters<
          ReturnType<typeof quickDashClient>["site"]["checkout"]
        >[0],
        checkoutAttempt.current,
      );

      if (!checkout.payment) {
        throw new Error(
          checkout.paymentUnavailableReason ??
            "This store cannot take payments right now. No payment was started.",
        );
      }

      const nextAction = checkout.payment.nextAction;
      if (nextAction.type === "approval") {
        window.location.assign(nextAction.approvalUrl);
        return;
      }
      if (nextAction.type === "redirect") {
        window.location.assign(nextAction.redirectUrl);
        return;
      }
      if (nextAction.type === "client_secret") {
        const payment = checkout.payment as typeof checkout.payment & {
          providerAccountId?: unknown;
        };
        if (
          typeof payment.providerAccountId !== "string" ||
          !payment.providerAccountId
        ) {
          throw new Error(
            "Stripe did not identify the connected merchant account. No card details were collected.",
          );
        }
        const pending = {
          clientSecret: nextAction.clientSecret,
          order: checkout.order,
          providerAccountId: payment.providerAccountId,
        };
        sessionStorage.setItem(
          "caffeinate-checkout",
          JSON.stringify({
            ...pending,
            externalPaymentId: checkout.payment.externalPaymentId,
            provider: checkout.payment.provider,
          }),
        );
        setStripeCheckout(pending);
        return;
      }

      setCompletedOrder(checkout.order);
      clear();
    } catch (error) {
      pushToast({
        code: "PAYMENT",
        message:
          error instanceof Error
            ? error.message.toUpperCase()
            : "QUICKDASH COULD NOT START PAYMENT.",
        tone: "error",
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // 🔴 The receipt is checked FIRST, before any cart-state guard.
  //
  // A paid order empties the cart by design, so every guard below is true at the
  // exact moment the customer has succeeded. Ordering this after them showed
  // "CHECKOUT_BLOCKED / NO ORDER PAYLOAD" to somebody whose card had just been
  // charged, which reads as a failed payment. Observed on the first real
  // purchase, 2026-08-11.
  if (completedOrder) {
    return (
      <section className="order-receipt">
        <p>% order commit --confirmed</p>
        <h2>ORDER RECEIVED.</h2>
        <dl>
          <div>
            <dt>ORDER</dt>
            <dd>{completedOrder.number}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{completedOrder.status.toUpperCase()}</dd>
          </div>
          <div>
            <dt>TOTAL</dt>
            <dd>
              ${money(completedOrder.totalCents)} {completedOrder.currency}
            </dd>
          </div>
        </dl>
        <a className="cursor-pointer" href="/account/orders">
          VIEW ORDER LOG
        </a>
      </section>
    );
  }

  /**
   * 🔴 A subscription checkout carries NO ITEMS, deliberately.
   *
   * The API refuses `items` and `subscriptionPlanId` in the same request — a
   * plan already knows what it contains — so a plan checkout arrives with an
   * empty cart by design.
   *
   * This guard did not know that, so every subscription attempt hit
   * "CHECKOUT_BLOCKED / NO ORDER PAYLOAD" and told the customer to add a coffee
   * they were not buying. The plan branch below was fully implemented and
   * completely unreachable: the subscribe button had never once worked.
   *
   * ⚠️ `planId` is read from the query string, so this must stay AFTER the
   * effect that reads it or the first render blocks a valid checkout.
   */
  if (availableItems.length === 0 && !planId) {
    return (
      <section className="empty-state">
        <p>STATUS / CHECKOUT_BLOCKED</p>
        <h2>NO ORDER PAYLOAD.</h2>
        <p>ADD AT LEAST ONE COFFEE BUILD BEFORE STARTING CHECKOUT.</p>
        <a className="cursor-pointer" href="/coffee">
          BROWSE COFFEE
        </a>
      </section>
    );
  }

  if (inventoryBlocked) {
    return (
      <section className="empty-state">
        <p>STATUS / INVENTORY_CHANGED</p>
        <h2>ORDER NEEDS ATTENTION.</h2>
        <p>
          STOCK CHANGED AFTER THIS CART WAS BUILT. RETURN TO THE CART AND ADJUST
          THE AFFECTED COFFEE BEFORE PAYMENT.
        </p>
        <a className="cursor-pointer" href="/cart">
          REVIEW CART
        </a>
      </section>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="checkout-workspace">
        <ol className="checkout-progress" aria-label="Checkout progress">
          {steps.map((item, index) => (
            <li
              data-current={item === step ? "true" : undefined}
              data-complete={index < currentStep ? "true" : undefined}
              key={item}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>

        {step === "ACCESS" ? (
          <section className="checkout-panel">
            <div className="checkout-form-heading">
              <p>% select checkout_identity</p>
              <h2>HOW ARE YOU CHECKING OUT?</h2>
            </div>
            <div className="checkout-access-options">
              <article>
                <p>01 / GUEST</p>
                <h3>CHECKOUT AS GUEST.</h3>
                <p>
                  ENTER CONTACT AND DELIVERY INFORMATION FOR THIS ORDER. NO
                  ACCOUNT IS REQUIRED.
                </p>
                <button
                  className="cursor-pointer"
                  onClick={() => setStep("CONTACT")}
                  type="button"
                >
                  CONTINUE AS GUEST
                </button>
              </article>
              <article>
                <p>02 / CUSTOMER</p>
                <h3>
                  {session ? "SESSION AVAILABLE." : "SIGN IN PASSWORDLESSLY."}
                </h3>
                <p>
                  {session
                    ? `CONTINUE AS ${session.email}.`
                    : "USE EMAIL OR GOOGLE FOR SAVED DETAILS AND ORDER HISTORY."}
                </p>
                {session ? (
                  <button
                    className="cursor-pointer"
                    onClick={() => {
                      setData((current) => ({
                        ...current,
                        email: session.email,
                      }));
                      setStep("CONTACT");
                    }}
                    type="button"
                  >
                    CONTINUE SIGNED IN
                  </button>
                ) : (
                  <a className="secondary-cta cursor-pointer" href="/account">
                    GO TO SIGN IN
                  </a>
                )}
              </article>
            </div>
          </section>
        ) : null}

        {step === "CONTACT" ? (
          <form
            className="checkout-form"
            onSubmit={(event) => updateFromForm(event, "DELIVERY")}
          >
            <div className="checkout-form-heading">
              <p>% collect customer_identity</p>
              <h2>CONTACT.</h2>
            </div>
            <label htmlFor="checkout-email">EMAIL</label>
            <input
              autoComplete="email"
              defaultValue={data.email}
              id="checkout-email"
              name="email"
              required
              type="email"
            />
            <label htmlFor="checkout-first-name">FIRST NAME</label>
            <input
              autoComplete="given-name"
              defaultValue={data.firstName}
              id="checkout-first-name"
              name="firstName"
              required
            />
            <label htmlFor="checkout-last-name">LAST NAME</label>
            <input
              autoComplete="family-name"
              defaultValue={data.lastName}
              id="checkout-last-name"
              name="lastName"
              required
            />
            <div className="checkout-actions">
              <button
                className="secondary-cta cursor-pointer"
                onClick={() => setStep("ACCESS")}
                type="button"
              >
                BACK
              </button>
              <button className="cursor-pointer" type="submit">
                CONTINUE TO DELIVERY
              </button>
            </div>
          </form>
        ) : null}

        {step === "DELIVERY" ? (
          <form className="checkout-form" onSubmit={quoteShipping}>
            <div className="checkout-form-heading">
              <p>% resolve delivery_address</p>
              <h2>DELIVERY.</h2>
            </div>
            <label htmlFor="checkout-address">STREET ADDRESS</label>
            <input
              autoComplete="street-address"
              defaultValue={data.address}
              id="checkout-address"
              name="address"
              required
            />
            <label htmlFor="checkout-city">CITY</label>
            <input
              autoComplete="address-level2"
              defaultValue={data.city}
              id="checkout-city"
              name="city"
              required
            />
            <label htmlFor="checkout-province">PROVINCE</label>
            <select
              autoComplete="address-level1"
              defaultValue={data.province}
              id="checkout-province"
              name="province"
              required
            >
              <option disabled value="">
                SELECT PROVINCE
              </option>
              {CA_PROVINCES.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            <label htmlFor="checkout-postal">POSTAL CODE</label>
            <input
              autoComplete="postal-code"
              defaultValue={data.postalCode}
              id="checkout-postal"
              name="postalCode"
              required
            />
            <label htmlFor="checkout-country">COUNTRY</label>
            <select
              defaultValue={data.country}
              id="checkout-country"
              name="country"
            >
              <option value="CA">CANADA</option>
            </select>
            <div className="checkout-actions">
              <button
                className="secondary-cta cursor-pointer"
                onClick={() => setStep("CONTACT")}
                type="button"
              >
                BACK
              </button>
              <button
                className="cursor-pointer"
                disabled={shippingLoading}
                type="submit"
              >
                {shippingLoading ? "CALCULATING..." : "CALCULATE SHIPPING"}
              </button>
            </div>
          </form>
        ) : null}

        {step === "SHIPPING" ? (
          <form
            className="checkout-form"
            onSubmit={(event) => updateFromForm(event, "PAYMENT")}
          >
            <div className="checkout-form-heading">
              <p>% select shipping_rate --preview</p>
              <h2>SHIPPING.</h2>
            </div>
            <fieldset className="shipping-options">
              <legend className="visually-hidden">Shipping method</legend>
              {shippingQuote?.options.map((option, index) => (
                <label key={option.rateId}>
                  <input
                    defaultChecked={
                      data.shippingRateId === option.rateId || index === 0
                    }
                    name="shippingRateId"
                    type="radio"
                    value={option.rateId}
                  />
                  <span>
                    <strong>{option.name.toUpperCase()}</strong>
                    <small>
                      {option.estimatedDaysMin !== null &&
                      option.estimatedDaysMax !== null
                        ? `${option.estimatedDaysMin}–${option.estimatedDaysMax} BUSINESS DAYS / `
                        : ""}
                      ${money(option.amountCents)} {currency}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="checkout-disclaimer">
              LIVE RATE / {shippingQuote?.zone.name.toUpperCase()}
            </p>
            <div className="checkout-actions">
              <button
                className="secondary-cta cursor-pointer"
                onClick={() => setStep("DELIVERY")}
                type="button"
              >
                BACK
              </button>
              <button className="cursor-pointer" type="submit">
                CONTINUE TO PAYMENT
              </button>
            </div>
          </form>
        ) : null}

        {step === "PAYMENT" ? (
          <section className="checkout-panel">
            <div className="checkout-form-heading">
              <p>% mount payment_provider</p>
              <h2>PAYMENT.</h2>
            </div>
            <div className="payment-seam">
              <p>STRIPE PAYMENT ELEMENT</p>
              <strong>AWAITING PROVIDER CONNECTION</strong>
              <p>
                NO CARD DATA WILL PASS THROUGH THE CAFFEINATE APPLICATION
                SERVER.
              </p>
            </div>
            <div className="checkout-actions">
              <button
                className="secondary-cta cursor-pointer"
                onClick={() => setStep("SHIPPING")}
                type="button"
              >
                BACK
              </button>
              <button
                className="cursor-pointer"
                onClick={() => setStep("REVIEW")}
                type="button"
              >
                REVIEW ORDER
              </button>
            </div>
          </section>
        ) : null}

        {step === "REVIEW" ? (
          <section className="checkout-panel">
            <div className="checkout-form-heading">
              <p>% verify order_payload</p>
              <h2>REVIEW.</h2>
            </div>
            <dl className="checkout-review">
              <div>
                <dt>CONTACT</dt>
                <dd>{data.email}</dd>
              </div>
              <div>
                <dt>DELIVERY</dt>
                <dd>
                  {data.address}, {data.city}, {data.province} {data.postalCode}
                </dd>
              </div>
              <div>
                <dt>SHIPPING</dt>
                <dd>
                  {shippingOption?.name.toUpperCase() ?? "SELECTED RATE"} / $
                  {money(shipping)} {currency}
                </dd>
              </div>
              <div>
                <dt>PAYMENT</dt>
                <dd>STRIPE / SECURE ELEMENT</dd>
              </div>
            </dl>
            {stripeCheckout ? (
              <StripePaymentElement
                amountLabel={`$${money(stripeCheckout.order.totalCents)} ${stripeCheckout.order.currency}`}
                clientSecret={stripeCheckout.clientSecret}
                providerAccountId={stripeCheckout.providerAccountId}
                onConfirmed={() => {
                  clear();
                  setCompletedOrder(stripeCheckout.order);
                }}
              />
            ) : (
              <div className="checkout-actions">
                <button
                  className="secondary-cta cursor-pointer"
                  onClick={() => setStep("PAYMENT")}
                  type="button"
                >
                  BACK
                </button>
                <button
                  className="cursor-pointer"
                  disabled={submittingOrder}
                  onClick={startPayment}
                  type="button"
                >
                  {submittingOrder
                    ? "OPENING PAYMENT..."
                    : `AUTHORIZE $${money(total)} ${currency}`}
                </button>
              </div>
            )}
          </section>
        ) : null}
      </section>

      <aside className="checkout-summary">
        <p>{"// ORDER_PAYLOAD / LOCAL_PREVIEW"}</p>
        <ul>
          {availableItems.map((item) => (
            <li key={item.catalogItemId}>
              <span>
                {item.quantity}× {item.product.name}
              </span>
              <span>${money(item.product.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl>
          <div>
            <dt>SUBTOTAL</dt>
            <dd>
              ${money(subtotal)} {currency}
            </dd>
          </div>
          {appliedDiscount ? (
            <div>
              <dt>DISCOUNT / {appliedDiscount.code.toUpperCase()}</dt>
              <dd>
                -${money(discount)} {currency}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>SHIPPING</dt>
            <dd>
              ${money(shipping)} {currency}
            </dd>
          </div>
          <div>
            <dt>TAX</dt>
            <dd>ADDED AT PAYMENT</dd>
          </div>
        </dl>
        {/*
         * 🔴 "BEFORE TAX", not "TOTAL".
         *
         * This said CURRENT TOTAL and showed $12.50 while the card was charged
         * $13.12 — the 5% the shop is registered for. A line labelled TOTAL that
         * is not the total is the single worst thing a checkout can show: the
         * shopper agreed to one number and their statement says another, and
         * every one of those becomes a support message or a chargeback.
         *
         * ⚠️ The honest fix is a server-priced quote, because tax belongs to the
         * business's settings and must never be computed twice. Until that
         * endpoint exists this says plainly what it is, and the pay button
         * already shows the real total the API returned.
         */}
        <div className="checkout-total">
          <span>BEFORE TAX</span>
          <strong>
            ${money(total)} {currency}
          </strong>
        </div>
        <p className="checkout-total-note">
          TAX IS ADDED WHEN YOU PAY. THE PAY BUTTON SHOWS THE FULL AMOUNT YOU
          WILL BE CHARGED.
        </p>
      </aside>
    </div>
  );
}
