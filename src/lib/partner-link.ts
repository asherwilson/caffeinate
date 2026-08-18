/**
 * The partner code a visitor arrived through, and any discount it carried.
 *
 * Written by `src/app/[slug]/route.ts` when somebody follows a link like
 * `caffeinate.sh/sarahbrews`, and read here at checkout.
 *
 * 🔑 Two cookies rather than one, because either can exist without the other: a
 * link can attribute an order to a partner while taking nothing off the price,
 * and a discount can be typed in by somebody who arrived on their own.
 */

const read = (name: string): string | null => {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(
		new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
	);
	return match ? decodeURIComponent(match[1]) : null;
};

/** Who gets credit for this order. */
export const partnerCode = () => read("caffeinate_ref");

/** What the visitor gets off, if the link carried a discount. */
export const partnerDiscountCode = () => read("caffeinate_discount");

/**
 * Consume the one-shot arrival marker.
 *
 * ⚠️ Reading it DELETES it. The greeting belongs to the moment somebody follows
 * a link, not to every page they open for the next month, and a flag that is
 * only cleared on some paths eventually shows the message twice.
 *
 * Returns the discount code that arrived with the link, `""` when the link
 * carried none, and `null` when nobody just arrived.
 */
export function takeArrival(): string | null {
	const value = read("caffeinate_ref_arrived");
	if (value === null) return null;
	document.cookie = "caffeinate_ref_arrived=; Path=/; Max-Age=0";
	return value;
}
