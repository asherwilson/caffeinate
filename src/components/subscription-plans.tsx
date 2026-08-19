"use client";

import { useEffect, useState } from "react";
import { quickDashConfigured } from "@/lib/quickdash";

/**
 * The plans a shopper can actually sign up to.
 *
 * ⚠️ Renders nothing when there are no plans. An empty "choose a plan" heading
 * is worse than no section: it implies the shop is broken rather than that the
 * owner has not published one yet.
 *
 * 🔑 Subscribing goes through the SAME checkout as a one-off order, carrying the
 * plan id instead of a basket. Nothing about the address, the payment element or
 * the confirmation is duplicated — a subscription is a standing order, and the
 * storefront treats it as one.
 */

type Plan = {
  id: string;
  name: string;
  interval: "week" | "month" | "year";
  intervalCount: number;
  priceCents: number;
  currency: string;
  items: Array<{ name: string; quantity: number }>;
};

const every = (count: number, interval: string) =>
  count === 1
    ? `EVERY ${interval.toUpperCase()}`
    : `EVERY ${count} ${interval.toUpperCase()}S`;

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!quickDashConfigured) return;
    let cancelled = false;
    void (async () => {
      try {
        /**
         * ⚠️ A direct call rather than an SDK method.
         *
         * The INSTALLED Quick.js package predates `listSubscriptionPlans` —
         * this storefront depends on a published version, not the monorepo
         * source. Swap to `client.site.listSubscriptionPlans()` once the
         * release carrying it is installed.
         */
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
        const body = (await response.json()) as { data?: { items?: Plan[] } };
        if (!cancelled) setPlans(body.data?.items ?? []);
      } catch {
        // A shop that cannot list plans still sells coffee by the bag. This
        // section simply does not appear.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (plans.length === 0) {
    return (
      <p>
        No standing orders are open right now. Everything in the shop is
        available to order one bag at a time.
      </p>
    );
  }

  return (
    <div className="plan-list">
      {plans.map((plan) => (
        <div className="plan-card" key={plan.id}>
          <p className="plan-name">{plan.name.toUpperCase()}</p>
          <p className="plan-price">
            {new Intl.NumberFormat(undefined, {
              currency: plan.currency,
              style: "currency",
            }).format(plan.priceCents / 100)}{" "}
            <span>{every(plan.intervalCount, plan.interval)}</span>
          </p>
          <p className="plan-contents">
            {plan.items
              .map((item) =>
                item.quantity > 1
                  ? `${item.quantity} × ${item.name}`
                  : item.name,
              )
              .join(" / ")}
          </p>
          {/* A plain link, not a fetch: checkout owns the address, the payment
					    element and the confirmation, and duplicating any of that here
					    would give a subscriber a worse version of the same flow. */}
          <a className="plan-action" href={`/checkout?plan=${plan.id}`}>
            START THIS
          </a>
        </div>
      ))}
    </div>
  );
}
