"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { quickDashClient, quickDashConfigured } from "@/lib/quickdash";

/**
 * Whether the shop is open, and whether its money is real.
 *
 * ── Why a storefront must know both ─────────────────────────────────────────
 *
 * 🔴 The API refuses a checkout when the shop is closed, and that guard is what
 * actually protects the business. This exists so the refusal is not the FIRST
 * thing a customer hears about it: choosing coffee, entering an address and
 * typing a card, only to be told the shop was never open, is a worse experience
 * than not being able to start.
 *
 * ⚠️ Test mode is surfaced for a different and sharper reason. A shop on test
 * credentials looks completely ordinary and takes no money — a real person can
 * complete a purchase, receive a confirmation, and be charged nothing. They
 * wait for coffee that is not coming. Saying so plainly is the only honest
 * option while the mode is on.
 */

type ShopState = { published: boolean; environment: "test" | "live" };

// Assumed open until told otherwise: a shop that flickers "closed" on every
// load while the context request is in flight is worse than one that never says
// it. The server refuses regardless, so optimism here costs nothing real.
const ShopStateContext = createContext<ShopState>({
  environment: "live",
  published: true,
});

export function ShopStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>({
    environment: "live",
    published: true,
  });

  useEffect(() => {
    if (!quickDashConfigured) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await quickDashClient().site.context();
        if (cancelled) return;
        /**
         * ⚠️ Narrowed here rather than read straight off the SDK type.
         *
         * The API returns these two fields today, but the INSTALLED Quick.js
         * package predates them — this storefront depends on a published
         * version, not the monorepo source. Remove the cast once the SDK
         * release carrying `published` and `environment` is installed.
         */
        const workspace = data.workspace as typeof data.workspace & {
          published?: boolean;
          environment?: "test" | "live";
        };
        setState({
          environment: workspace.environment ?? "live",
          published: workspace.published ?? true,
        });
      } catch {
        // An unreachable API is not a closed shop. Leaving the optimistic
        // default means the customer meets the real error where it happens.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ShopStateContext.Provider value={state}>
      {children}
    </ShopStateContext.Provider>
  );
}

export const useShopState = () => useContext(ShopStateContext);

/**
 * The notice itself.
 *
 * Renders nothing in the normal case — an open, live shop should carry no
 * banner at all, because a bar that is always there stops being read.
 */
export function ShopNotice() {
  const { published, environment } = useShopState();

  if (!published) {
    return (
      <output className="shop-notice shop-notice-closed">
        THIS SHOP IS CLOSED FOR MAINTENANCE / ORDERS CANNOT BE PLACED RIGHT NOW.
      </output>
    );
  }
  if (environment === "test") {
    return (
      <output className="shop-notice shop-notice-test">
        TEST MODE / PAYMENTS ARE NOT REAL AND NO ORDER WILL BE FULFILLED.
      </output>
    );
  }
  return null;
}
