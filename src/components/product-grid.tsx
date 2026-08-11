"use client";

import Image from "next/image";
import { AddToCart } from "./add-to-cart";
import { useCatalog } from "./catalog-store";

export function ProductGrid() {
  const { availabilityFor, connected, loading, products } = useCatalog();
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
              <Image
                alt={product.name}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 720px) 100vw, 33vw"
                src={product.image}
              />
            </a>
            <p>#{String(index + 1).padStart(2, "0")} / RELEASE</p>
            <h2>
              <a className="cursor-pointer" href={`/coffee/${product.slug}`}>
                {product.name}
              </a>
            </h2>
            <p>{product.roast}</p>
            <p>
              ${(product.priceCents / 100).toFixed(2)} {product.currency} / 340G
            </p>
            <p>STATUS / {stockLabel}</p>
            <div className="store-product-actions">
              <a className="cursor-pointer" href={`/coffee/${product.slug}`}>
                INSPECT
              </a>
              <AddToCart slug={product.slug} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
