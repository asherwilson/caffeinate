"use client";

import { useEffect } from "react";
import { takeArrival } from "@/lib/partner-link";
import { useToast } from "./toast-store";

/**
 * Say, once, that a partner link worked.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * 🔴 Following `caffeinate.sh/sarahbrews` set two cookies and dropped the
 * visitor on the home page in silence. That is correct behaviour and reads as a
 * broken link: somebody was promised a discount, saw nothing acknowledge it,
 * and has no reason to believe it will appear at checkout.
 *
 * ⚠️ A toast, not a banner. A persistent bar for a personal referral is read as
 * an advertisement within one page, and it is still there three pages later
 * when nobody cares. The durable proof belongs in the basket, where the number
 * actually changes — this is only the acknowledgement.
 */
export function PartnerArrival() {
  const { pushToast } = useToast();

  useEffect(() => {
    const discountCode = takeArrival();
    if (discountCode === null) return;
    pushToast(
      discountCode
        ? {
            code: discountCode,
            message: `${discountCode} applied — you will see it come off at checkout.`,
            tone: "success",
          }
        : {
            message: "You arrived through a partner link.",
            tone: "info",
          },
    );
  }, [pushToast]);

  return null;
}
