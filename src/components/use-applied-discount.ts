"use client";

import { useEffect, useState } from "react";
import { partnerDiscountCode } from "@/lib/partner-link";
import { quickDashClient } from "@/lib/quickdash";

/**
 * What the remembered discount is actually worth against this basket.
 *
 * ── Why the server prices it ─────────────────────────────────────────────────
 *
 * 🔴 The browser must never compute this. `/v1/discounts/preview` deliberately
 * takes the ITEMS rather than a subtotal, because a client that sends its own
 * subtotal can claim a £10,000 basket to clear a minimum-spend threshold, or
 * compute a percentage against a number it invented. The server prices the same
 * items it will price at checkout, so the basket and the final total cannot
 * disagree — which is the entire point of showing it here at all.
 *
 * ⚠️ Returns null rather than throwing on any failure. A discount that cannot
 * be priced right now is a line that does not appear; it is never a reason a
 * basket fails to render.
 */
export function useAppliedDiscount(
	items: ReadonlyArray<{ catalogItemId: string; quantity: number }>,
) {
	const [applied, setApplied] = useState<{
		code: string;
		amountCents: number;
	} | null>(null);

	// Re-priced whenever the basket changes: removing the item a code applied to
	// must remove the line, not leave a stale saving on screen.
	const signature = items
		.map((item) => `${item.catalogItemId}:${item.quantity}`)
		.join(",");

	useEffect(() => {
		const code = partnerDiscountCode();
		if (!code || items.length === 0) {
			setApplied(null);
			return;
		}
		let cancelled = false;
		void (async () => {
			try {
				const { data } = await quickDashClient().site.previewDiscount({
					code,
					items: items.map((item) => ({
						catalogItemId: item.catalogItemId,
						quantity: item.quantity,
					})),
				});
				if (cancelled) return;
				// A discriminated union: an invalid code carries a reason, not an
				// amount, so the narrow is what keeps the two shapes apart.
				setApplied(
					data.valid && data.discountCents > 0
						? { amountCents: data.discountCents, code: data.code }
						: null,
				);
			} catch {
				if (!cancelled) setApplied(null);
			}
		})();
		return () => {
			cancelled = true;
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: re-price on basket contents
	}, [signature]);

	return applied;
}
