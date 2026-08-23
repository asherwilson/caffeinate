"use client";

import { useEffect, useState } from "react";

type QuoteAddress = {
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
};

export type CheckoutQuote = {
  currency: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

/**
 * What this basket will actually cost, priced by the server.
 *
 * ── Why the browser cannot do this ───────────────────────────────────────────
 *
 * 🔴 Tax is a workspace setting, applied to the discounted subtotal plus
 * delivery, and depends on where the parcel is going. Nothing in a browser knows
 * it. So checkout used to add up the parts it could see — `subtotal − discount +
 * shipping` — call the result TOTAL, and then charge more: $12.50 on screen,
 * $13.12 on the card.
 *
 * A figure beside a pay button is the moment somebody CONSENTS. A different
 * figure leaving their account is a support message at best and a chargeback at
 * worst, and the customer is right both times.
 *
 * 🔑 `/v1/checkout/quote` runs the SAME pricing code `/v1/checkout` charges
 * with, so the number shown and the number taken cannot disagree. Computing tax
 * here instead would work today, at one flat rate, and silently charge the wrong
 * amount the day it becomes per-jurisdiction — which is the direction every tax
 * system moves.
 *
 * ⚠️ Returns null rather than throwing. A total that cannot be priced right now
 * is a line the interface has to be honest about; it is never a reason checkout
 * fails to render.
 */
export function useCheckoutQuote(input: {
  items: ReadonlyArray<{ catalogItemId: string; quantity: number }>;
  discountCode: string | null;
  shippingRateId?: string | null;
  shippingAddress?: QuoteAddress | null;
}) {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  /**
   * 🔑 Re-priced from a SIGNATURE rather than by depending on the objects.
   *
   * `items` and `shippingAddress` are rebuilt on every render, so depending on
   * them directly would ask the server for a total on every keystroke. The
   * signature only changes when something that affects the price does.
   */
  const address = input.shippingAddress;
  const complete = Boolean(
    address?.countryCode && address?.postalCode && address?.region,
  );
  const signature = [
    input.items
      .map((item) => `${item.catalogItemId}:${item.quantity}`)
      .join(","),
    input.discountCode ?? "",
    input.shippingRateId ?? "",
    complete
      ? `${address?.countryCode}/${address?.region}/${address?.postalCode}`
      : "",
  ].join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the signature, which is what actually changes the price
  useEffect(() => {
    if (input.items.length === 0) {
      setQuote(null);
      return;
    }
    let live = true;
    void (async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_QUICKDASH_API_URL}/v1/checkout/quote`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "QuickEngine-Workspace":
                process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID ?? "",
              "QuickEngine-Publishable-Key":
                process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY ?? "",
            },
            body: JSON.stringify({
              items: input.items.map((item) => ({
                catalogItemId: item.catalogItemId,
                quantity: item.quantity,
              })),
              discountCode: input.discountCode ?? undefined,
              /**
               * ⚠️ Delivery only once BOTH a rate and a full address exist.
               * Sending half an address gets the quote refused, which would show
               * the shopper an error for something they are still filling in.
               */
              ...(complete && input.shippingRateId
                ? {
                    shippingRateId: input.shippingRateId,
                    shippingAddress: address,
                  }
                : {}),
            }),
          },
        );
        if (!live) return;
        if (!response.ok) {
          setQuote(null);
          return;
        }
        const body = (await response.json()) as { data?: CheckoutQuote };
        if (live && body.data) setQuote(body.data);
      } catch {
        // Offline, or the shop is unreachable. The interface says the total is
        // not final yet rather than inventing one.
        if (live) setQuote(null);
      }
    })();
    return () => {
      live = false;
    };
  }, [signature]);

  return quote;
}
