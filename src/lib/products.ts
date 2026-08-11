export type StoreProduct = {
  catalogItemId: string;
  currency: string;
  description: string;
  image: string;
  name: string;
  priceCents: number;
  roast: string;
  sku: string | null;
  slug: string;
  weightGrams: number | null;
};

export const productPresentation = [
  {
    description:
      "Chocolate, caramel, and brown sugar. The dependable daily build.",
    image: "/images/image-2.jpg",
    name: "HOUSE PROCESS",
    priceCents: 2_400,
    roast: "MEDIUM ROAST",
    slug: "house-process",
  },
  {
    description: "Cocoa, smoke, and molasses for low-light operating hours.",
    image: "/images/image-3.jpg",
    name: "DARK MODE",
    priceCents: 2_400,
    roast: "DARK ROAST",
    slug: "dark-mode",
  },
  {
    description: "Citrus, honey, and stone fruit for emergency intervention.",
    image: "/images/image-4.jpg",
    name: "HOTFIX",
    priceCents: 2_600,
    roast: "LIGHT ROAST",
    slug: "hotfix",
  },
] as const;

// Presentation-only compatibility for the three designed detail routes. The
// shop, cart and checkout consume the live QuickDash catalog through
// CatalogProvider; these exports keep the authored marketing routes stable
// until catalog media/roast metadata is editable in QuickDash too.
export const products = productPresentation.map((product) => ({
  ...product,
  price: product.priceCents / 100,
}));

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const fallbackProducts: StoreProduct[] = productPresentation.map(
  (product) => ({
    ...product,
    catalogItemId: `local:${product.slug}`,
    currency: "CAD",
    sku: null,
    weightGrams: 340,
  }),
);

export function productSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function presentationFor(slug: string) {
  return productPresentation.find((product) => product.slug === slug);
}
