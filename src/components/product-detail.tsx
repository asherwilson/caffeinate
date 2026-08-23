"use client";

import Image from "next/image";
import { AddToCart } from "@/components/add-to-cart";
import { useCatalog } from "@/components/catalog-store";
import { ProductReviews } from "@/components/product-reviews";
import { WishlistButton } from "@/components/wishlist-button";
import { formatWeight } from "@/lib/products";

/**
 * One product, entirely from QuickDash.
 *
 * 🔴 Every line below is catalog data. The version this replaced read from a
 * hardcoded list of three coffees and printed `FORMAT / 340G / WHOLE_BEAN` as a
 * literal — so a 1kg bag advertised itself as 340g, and any product not in the
 * list 404'd however real it was.
 *
 * ⚠️ Three states, not two. "Loading" and "no such product" are different
 * answers and a shopper deserves to know which: a spinner that turns into
 * "not found" is honest, one that silently becomes an empty page is not.
 */
export function ProductDetail({ slug }: { slug: string }) {
  const { availabilityFor, findProduct, loading } = useCatalog();
  const product = findProduct(slug);

  if (loading) {
    return <p className="product-detail-status">LOADING PRODUCT…</p>;
  }

  if (!product) {
    return (
      <p className="product-detail-status">
        NO SUCH PRODUCT. It may have been unpublished.
      </p>
    );
  }

  const availability = availabilityFor(product.catalogItemId);
  const soldOut = availability?.available === false;
  const weight = formatWeight(product.weightGrams);

  return (
    <>
      <div className="product-detail">
      <div className="product-detail-image">
        {/*
         * ⚠️ A product with no photograph shows a marked empty frame, never a
         * stock image of somebody else's coffee. A placeholder that looks like
         * a product is a lie about what is being sold.
         */}
        {product.image ? (
          <Image
            alt={product.name}
            fill
            priority
            sizes="(max-width: 720px) 100vw, 55vw"
            src={product.image}
          />
        ) : (
          <div className="product-detail-image-empty">NO IMAGE</div>
        )}
      </div>
      <div className="product-detail-controls">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        {product.roast ? <p>ROAST / {product.roast}</p> : null}
        {/* Only the parts the catalog actually knows. */}
        {weight || product.unitLabel ? (
          <p>
            FORMAT /{" "}
            {[weight, product.unitLabel?.toUpperCase()]
              .filter(Boolean)
              .join(" / ")}
          </p>
        ) : null}
        <p>
          PRICE / ${(product.priceCents / 100).toFixed(2)} {product.currency}
          {/*
           * A strike-through only when the catalog says there is one, and only
           * when it is genuinely higher — a "was" price below the real one is
           * how a shop ends up making a claim it cannot support.
           */}
          {product.compareAtPriceCents &&
          product.compareAtPriceCents > product.priceCents ? (
            <span className="product-detail-was">
              {" "}
              WAS ${(product.compareAtPriceCents / 100).toFixed(2)}
            </span>
          ) : null}
        </p>
        {product.sku ? <p>SKU / {product.sku}</p> : null}
        <p>STATUS / {soldOut ? "SOLD OUT" : "AVAILABLE"}</p>
        <div className="product-detail-buttons">
          {soldOut ? null : <AddToCart slug={product.slug} />}
          {/* Saving is worth offering even when it is sold out — arguably
              most worth offering then. */}
          <WishlistButton catalogItemId={product.catalogItemId} />
        </div>
      </div>
      </div>
      <ProductReviews catalogItemId={product.catalogItemId} />
    </>
  );
}
