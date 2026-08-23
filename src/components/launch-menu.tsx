"use client";

import { useCatalog } from "@/components/catalog-store";
import { formatWeight } from "@/lib/products";

/**
 * What is on sale, on the home page, from the catalog.
 *
 * 🔴 This used to be three hardcoded coffees — HOUSE PROCESS, DARK MODE,
 * HOTFIX — linking to slugs QuickDash had never heard of, so every one of them
 * 404'd. Underneath sat a literal "THREE_ROASTS / 250G / WHOLE_BEAN", which
 * stayed three roasts and 250g no matter what the shop actually sold.
 *
 * ⚠️ Lists everything published. The shop page is the same list with more
 * detail beside it, not a longer one.
 */
export function LaunchMenu() {
  const { loading, products } = useCatalog();
  /**
   * 🔴 The FEATURED products, not all of them and not a fixed three.
   *
   * A business marks what leads on `metadata.featured`; the shop page lists
   * everything. This used to be a hardcoded three, then briefly everything —
   * both were the storefront deciding something that belongs to the person
   * running the shop.
   *
   * ⚠️ Falls back to the whole catalog when nothing is marked, because a home
   * page with no products reads as a closed shop. Somebody who has never
   * touched the flag still gets a working front page.
   */
  const marked = products.filter((product) => product.featured);
  const featured = marked.length > 0 ? marked : products;

  if (loading) {
    return (
      <section className="current-build" aria-labelledby="current-build-title">
        <p id="current-build-title" className="build-label">
          {"// LAUNCH_MENU"}
        </p>
        <p className="build-status">STATUS / LOADING</p>
      </section>
    );
  }

  /**
   * ⚠️ An empty shop says so. It used to show three coffees that did not
   * exist, which is worse than an empty shelf: a customer who clicks one gets
   * a 404 and concludes the whole site is broken.
   */
  if (featured.length === 0) {
    return (
      <section className="current-build" aria-labelledby="current-build-title">
        <p id="current-build-title" className="build-label">
          {"// LAUNCH_MENU"}
        </p>
        <p className="build-status">STATUS / NO_ROASTS_PUBLISHED</p>
      </section>
    );
  }

  const weights = [
    ...new Set(
      featured
        .map((product) => formatWeight(product.weightGrams))
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  return (
    <section className="current-build" aria-labelledby="current-build-title">
      <p id="current-build-title" className="build-label">
        {"// LAUNCH_MENU"}
      </p>
      {featured.map((product, index) => (
        <a
          className="cursor-pointer"
          href={`/coffee/${product.slug}`}
          key={product.catalogItemId}
        >
          <span>
            {String(index + 1).padStart(2, "0")} {product.name.toUpperCase()}
          </span>
          <span>{(product.roast ?? product.description).toUpperCase()}</span>
        </a>
      ))}
      <p className="build-status">
        STATUS / {featured.length}_ROAST{featured.length === 1 ? "" : "S"}
        {weights.length > 0 ? ` / ${weights.join(" / ")}` : ""}
      </p>
    </section>
  );
}
