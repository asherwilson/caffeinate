"use client";

import type {
  QuickCheckoutResult,
  QuickShippingQuote,
} from "@quickengine/quick/browser";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { partnerCode, partnerDiscountCode } from "@/lib/partner-link";
import { quickDashClient } from "@/lib/quickdash";
import { useCart } from "./cart-store";
import { useCatalog } from "./catalog-store";
import { useCustomerAuth } from "./customer-auth-store";
import { StripePaymentElement } from "./stripe-payment-element";
import { useToast } from "./toast-store";

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

export function CheckoutFlow() {
  const { clear, items } = useCart();
  // Read once on mount: a cookie written by the partner-link route.
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  useEffect(() => {
    setDiscountCode(partnerDiscountCode());
    setReferralCode(partnerCode());
  }, []);
  const {
    availabilityFor,
    findProductById,
    loading: catalogLoading,
  } = useCatalog();
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
        items: availableItems.map((item) => ({
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
        {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`.trim(),
          items: availableItems.map((item) => ({
            catalogItemId: item.catalogItemId,
            quantity: item.quantity,
          })),
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
        },
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

  if (availableItems.length === 0) {
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
            <input
              autoComplete="address-level1"
              defaultValue={data.province}
              id="checkout-province"
              name="province"
              required
            />
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
                      ${money(option.amountCents)} CAD
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
                  {money(shipping)} CAD
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
                    : `AUTHORIZE $${money(subtotal + shipping)} CAD`}
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
            <dd>${money(subtotal)} CAD</dd>
          </div>
          <div>
            <dt>SHIPPING</dt>
            <dd>${money(shipping)} CAD</dd>
          </div>
          <div>
            <dt>TAX</dt>
            <dd>CALCULATED BY API</dd>
          </div>
        </dl>
        <div className="checkout-total">
          <span>CURRENT TOTAL</span>
          <strong>${money(subtotal + shipping)} CAD</strong>
        </div>
      </aside>
    </div>
  );
}
