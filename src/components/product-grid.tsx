"use client";

import Image from "next/image";
import { useState } from "react";
import { formatWeight } from "@/lib/products";
import { AddToCart } from "./add-to-cart";
import { useCatalog } from "./catalog-store";
import { WishlistButton } from "./wishlist-button";

export function ProductGrid() {
  const {
    availabilityFor,
    categories,
    connected,
    loading,
    products: allProducts,
    productsInCategory,
  } = useCatalog();
  const [category, setCategory] = useState<string | null>(null);

  /**
   * ⚠️ An unknown category shows EVERYTHING rather than nothing.
   *
   * A stale link — a category renamed or emptied since somebody bookmarked it
   * — should land a shopper in the shop, not on a blank page that reads like
   * the business has closed.
   */
  const products =
    (category ? productsInCategory(category) : undefined) ?? allProducts;
  if (loading) {
    return (
      <section className="empty-state">
        <p>STATUS / SYNCING</p>
        <h2>LOADING LIVE BUILDS.</h2>
        <p>QUICKDASH IS VERIFYING THE CURRENT CATALOG.</p>
      </section>
    );
  }

  if (!connected || products.length === 0) {
    return (
      <section className="empty-state">
        <p>STATUS / CATALOG_UNAVAILABLE</p>
        <h2>NO LIVE BUILDS.</h2>
        <p>
          THE LIVE QUICKDASH CATALOG COULD NOT BE LOADED. PRICES AND CHECKOUT
          REMAIN DISABLED.
        </p>
      </section>
    );
  }

  return (
    <>
      {/*
       * 🔴 Only shown when there is a real choice to make. One category is not
       * a filter, it is the whole shop with an extra button that does nothing.
       */}
      {categories.length > 1 ? (
        <nav className="store-category-filter" aria-label="Product categories">
          <button
            aria-pressed={category === null}
            className="cursor-pointer"
            onClick={() => setCategory(null)}
            type="button"
          >
            ALL / {allProducts.length}
          </button>
          {categories.map((entry) => (
            <button
              aria-pressed={category === entry.slug}
              className="cursor-pointer"
              key={entry.id}
              onClick={() => setCategory(entry.slug)}
              type="button"
            >
              {entry.name.toUpperCase()} / {entry.itemCount}
            </button>
          ))}
        </nav>
      ) : null}
    <div className="store-product-grid">
      <p className="sr-only" aria-live="polite">
        Catalog connected to QuickDash
      </p>
      {products.map((product, index) => {
        const availability = availabilityFor(product.catalogItemId);
        const stockLabel = !availability?.tracked
          ? "AVAILABLE"
          : !availability.available
            ? "SOLD OUT"
            : availability.availableQuantity !== null &&
                availability.availableQuantity <= 5
              ? `LOW STOCK / ${availability.availableQuantity}`
              : "IN STOCK";
        return (
          <article
            className="store-product"
            data-availability={
              availability?.available === false ? "sold-out" : "available"
            }
            key={product.catalogItemId}
          >
            <a
              className="store-product-image cursor-pointer"
              href={`/coffee/${product.slug}`}
            >
              {/* No photograph shows an empty frame, never another shop's coffee. */}
              {product.image ? (
                <Image
                  alt={product.name}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 720px) 100vw, 33vw"
                  src={product.image}
                />
              ) : (
                <div className="store-product-image-empty">NO IMAGE</div>
              )}
            </a>
            <p>#{String(index + 1).padStart(2, "0")} / RELEASE</p>
            <h2>
              <a className="cursor-pointer" href={`/coffee/${product.slug}`}>
                {product.name}
              </a>
            </h2>
            {product.roast ? <p>{product.roast}</p> : null}
            {/*
             * 🔴 The weight comes from the catalog. This line used to end in
             * a literal "340G", so every product advertised 340g whatever it
             * actually weighed — a 1kg bag included.
             */}
            <p>
              ${(product.priceCents / 100).toFixed(2)} {product.currency}
              {formatWeight(product.weightGrams)
                ? ` / ${formatWeight(product.weightGrams)}`
                : ""}
            </p>
            <p>STATUS / {stockLabel}</p>
            <div className="store-product-actions">
              <a className="cursor-pointer" href={`/coffee/${product.slug}`}>
                INSPECT
              </a>
              <AddToCart slug={product.slug} />
              <WishlistButton catalogItemId={product.catalogItemId} />
            </div>
          </article>
        );
      })}
    </div>
    </>
  );
}
