/**
 * The shape the storefront renders a product in.
 *
 * 🔴 EVERY field here comes from QuickDash. There is no local product data in
 * this file any more, and there must not be again.
 *
 * It used to hold three hardcoded coffees plus a `fallbackProducts` list with
 * `weightGrams: 340`, rendered whenever the live catalog did not match. The
 * site therefore showed fake products, fake weights and a placeholder
 * photograph while reporting itself connected, and every link pointed at a slug
 * the backend had never heard of — so clicking one 404'd.
 *
 * The rule now: if a shopper can see it and it describes a product, it belongs
 * to the catalog. Page copy, section headings and decoration stay in the
 * components that draw them.
 */
export type StoreProduct = {
  catalogItemId: string;
  /** From `metadata.compareAtPriceCents`. Null when nothing is struck through. */
  compareAtPriceCents: number | null;
  currency: string;
  description: string;
  /**
   * From `metadata.featured`. The home page shows these; the shop shows
   * everything. A business decides what leads, not the storefront.
   */
  featured: boolean;
  /** From `metadata.images[0]`. Null renders a placeholder, never a fake photo. */
  image: string | null;
  /**
   * From `metadata.videos[0]`. Null is the ordinary case: most products have a
   * photograph and no video, so nothing about the layout may depend on one
   * being here.
   */
  video: string | null;
  /**
   * Every photograph, in the order the shop arranged them. `image` is the first
   * of these and stays for the places that only ever want one.
   */
  images: string[];
  /** Every video, same arrangement. Usually empty. */
  videos: string[];
  name: string;
  priceCents: number;
  /**
   * From `metadata.tags`, the first tag prefixed `roast:`.
   *
   * ⚠️ QuickDash has no roast field, so a tag is where it lives. That is
   * editable from the product screen today, which is the point: nothing about a
   * product should need a deploy to change.
   */
  roast: string | null;
  sku: string | null;
  slug: string;
  /** From `unitLabel` — "bag", "tin". Null shows nothing, never "340G". */
  unitLabel: string | null;
  weightGrams: number | null;
};

/**
 * A URL-safe slug from a name.
 *
 * ⚠️ Only used when a product carries no `metadata.slug`. Deriving from the
 * name is lossy: renaming a product silently changes its address and breaks
 * every link anybody saved. The catalog's own slug wins wherever it exists.
 */
export function productSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * How a weight reads on a card.
 *
 * Returns null rather than a guess when the catalog has no weight, so the
 * markup can omit the line instead of printing a number nobody entered — which
 * is exactly how "340G" ended up on a 1kg bag.
 */
export function formatWeight(grams: number | null): string | null {
  if (!grams || grams <= 0) return null;
  if (grams < 1000) return `${grams}G`;
  const kg = grams / 1000;
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)}KG`;
}

/** The roast tag, if the product carries one. `roast:medium` becomes `MEDIUM`. */
export function roastFromTags(tags: unknown): string | null {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find(
    (value): value is string =>
      typeof value === "string" && value.toLowerCase().startsWith("roast:"),
  );
  return tag ? tag.slice("roast:".length).trim().toUpperCase() || null : null;
}
