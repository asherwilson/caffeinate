"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useCart } from "./cart-store";

type StoredCheckout = {
  clientSecret: string;
  order: {
    number: string;
    totalCents: number;
    currency: string;
  };
  providerAccountId: string;
};

const money = (cents: number) => (cents / 100).toFixed(2);

export function CheckoutComplete() {
  const { clear } = useCart();
  const [checkout, setCheckout] = useState<StoredCheckout | null>(null);
  const [status, setStatus] = useState<"checking" | "confirmed" | "error">(
    "checking",
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("caffeinate-checkout");
    if (!stored) {
      setStatus("error");
      return;
    }

    let parsed: StoredCheckout;
    try {
      parsed = JSON.parse(stored) as StoredCheckout;
    } catch {
      setStatus("error");
      return;
    }

    if (!parsed.clientSecret || !parsed.providerAccountId || !parsed.order) {
      setStatus("error");
      return;
    }
    setCheckout(parsed);

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      setStatus("error");
      return;
    }

    void loadStripe(publishableKey, {
      stripeAccount: parsed.providerAccountId,
    }).then(async (stripe) => {
      if (!stripe) {
        setStatus("error");
        return;
      }
      const result = await stripe.retrievePaymentIntent(parsed.clientSecret);
      if (
        result.paymentIntent?.status === "succeeded" ||
        result.paymentIntent?.status === "processing"
      ) {
        clear();
        setStatus("confirmed");
        return;
      }
      setStatus("error");
    });
  }, [clear]);

  if (status === "checking") {
    return (
      <section className="empty-state">
        <p>STATUS / VERIFYING_PAYMENT</p>
        <h2>CHECKING PAYMENT SIGNAL.</h2>
      </section>
    );
  }

  if (status === "error" || !checkout) {
    return (
      <section className="empty-state">
        <p>STATUS / PAYMENT_UNCONFIRMED</p>
        <h2>PAYMENT NEEDS ATTENTION.</h2>
        <p>
          THE PAYMENT COULD NOT BE VERIFIED IN THIS BROWSER. CHECK YOUR ORDER
          LOG BEFORE TRYING AGAIN.
        </p>
        <a className="cursor-pointer" href="/account/orders">
          CHECK ORDER LOG
        </a>
      </section>
    );
  }

  return (
    <section className="order-receipt">
      <p>% payment verify --confirmed</p>
      <h2>ORDER RECEIVED.</h2>
      <dl>
        <div>
          <dt>ORDER</dt>
          <dd>{checkout.order.number}</dd>
        </div>
        <div>
          <dt>PAYMENT</dt>
          <dd>CONFIRMED</dd>
        </div>
        <div>
          <dt>TOTAL</dt>
          <dd>
            ${money(checkout.order.totalCents)} {checkout.order.currency}
          </dd>
        </div>
      </dl>
      <a className="cursor-pointer" href="/account/orders">
        VIEW ORDER LOG
      </a>
    </section>
  );
}
