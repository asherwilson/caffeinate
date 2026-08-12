/**
 * The order of the site, as a strip.
 *
 * Shared rather than living in the header, because it is now two things: the
 * navigation bar, and the left-to-right order you travel in when you arrow off
 * the edge of a page. Those must never disagree, or the numbers in the header
 * would stop describing where the arrows take you.
 */
/*
 * ⚠️ ACCOUNT is deliberately absent. GET CAFFEINATED points at `/account`, and
 * a numbered slot for the same page next to a button for it was two routes to
 * one destination. Removing it renumbers everything below it — the numbers are
 * positional, and a gap at 08 would read as a bug.
 */
export const navigation = [
  ["01", "COFFEE", "/coffee"],
  ["02", "SUBSCRIBE", "/subscribe"],
  ["03", "ABOUT", "/about"],
  ["04", "FAQ", "/faq"],
  ["05", "CONTACT", "/contact"],
  ["06", "CART", "/cart"],
  ["07", "SEARCH", "/search"],
  ["08", "ORDERS", "/account/orders"],
  ["09", "COMMANDS", "#commands"],
] as const;

/**
 * The pages you can actually travel to, in order. `#commands` opens the
 * terminal rather than navigating, so it is not one of them.
 *
 * 🔴 Home leads this list but has no entry in `navigation`. The brand mark is
 * the way home now, so it holds no numbered slot in the header — but it is
 * still a page, and arrowing left off COFFEE has to land somewhere. Deriving
 * this list purely from the header would have made the first page unreachable
 * by keyboard and broken `pageIndexFor("/")` with it.
 */
export const pageOrder = [
  "/",
  ...navigation
    .filter(([, , href]) => href.startsWith("/"))
    .map(([, , href]) => href as string),
];

/**
 * Which page this path is, as a position in the strip.
 *
 * Longest match wins so `/account/orders` is ORDERS rather than ACCOUNT, and a
 * product page like `/coffee/house-process` counts as COFFEE, so arrowing off
 * its edge continues the strip instead of dead-ending.
 */
export function pageIndexFor(pathname: string): number {
  let best = -1;
  let bestLength = 0;
  pageOrder.forEach((href, index) => {
    if (href === "/") return;
    if (
      (pathname === href || pathname.startsWith(`${href}/`)) &&
      href.length > bestLength
    ) {
      best = index;
      bestLength = href.length;
    }
  });
  if (best === -1 && pathname === "/") return 0;
  return best;
}

/** The page one step in this direction, or `null` at either end of the strip. */
export function adjacentPage(
  pathname: string,
  direction: "left" | "right",
): string | null {
  const index = pageIndexFor(pathname);
  if (index < 0) return null;
  const next = direction === "right" ? index + 1 : index - 1;
  return pageOrder[next] ?? null;
}
