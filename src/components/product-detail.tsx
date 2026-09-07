"use client";

import Image from "next/image";
import { useState } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { useCatalog } from "@/components/catalog-store";
import { MediaLightbox } from "@/components/media-lightbox";
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
  // 🔴 Before the early returns. A hook after a conditional return runs on some
  // renders and not others, which React forbids and which breaks the moment a
  // product loads late.
  const [selected, setSelected] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);

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

  /**
   * Every piece of media on the product, photographs first.
   *
   * 🔴 One list rather than two galleries. A shop that uploads three angles and
   * a clip is showing one product from four sides, and splitting them into
   * separate strips makes the customer work out that they belong together.
   *
   * ⚠️ Photographs lead. The first frame of a video is rarely the flattering
   * shot, and it is what a thumbnail has to use.
   */
  const media = [
    ...product.images.map((url) => ({ type: "image" as const, url })),
    ...product.videos.map((url) => ({ type: "video" as const, url })),
  ];
  const current = media[Math.min(selected, media.length - 1)];

  const availability = availabilityFor(product.catalogItemId);
  const soldOut = availability?.available === false;
  const weight = formatWeight(product.weightGrams);

  return (
    <>
      <MediaLightbox
        index={viewing}
        items={media}
        onClose={() => setViewing(null)}
        onIndexChange={(next) => {
          setViewing(next);
          setSelected(next);
        }}
      />
      <div className="product-detail">
        <div className="product-detail-image">
          {/*
           * ⚠️ A product with no media shows a marked empty frame, never a
           * stock image of somebody else's coffee. A placeholder that looks like
           * a product is a lie about what is being sold.
           */}
          {/* Clicking the main media opens it full size. `zoom-in` is the
              affordance; a picture that is clickable and does not say so is a
              feature nobody finds. */}
          {current?.type === "video" ? (
            /*
             * ⚠️ Muted and playsInline because it autoplays. Sound arriving
             * unasked is the fastest way to make somebody close the tab, and
             * iOS refuses to inline-play without both.
             */
            <video
              autoPlay
              className="product-detail-video"
              controls
              loop
              muted
              playsInline
              poster={product.image ?? undefined}
              src={current.url}
            >
              <track kind="captions" />
            </video>
          ) : current?.type === "image" ? (
            <Image
              alt={product.name}
              fill
              priority
              sizes="(max-width: 720px) 100vw, 55vw"
              src={current.url}
            />
          ) : (
            <div className="product-detail-image-empty">NO IMAGE</div>
          )}
          {current ? (
            <button
              aria-label="View full size"
              className="product-detail-zoom"
              onClick={() => setViewing(selected)}
              type="button"
            />
          ) : null}
        </div>
        {/* Only when there is a choice to make. One photograph and a strip of
            one is a control that does nothing. */}
        {media.length > 1 ? (
          <div className="product-detail-thumbs">
            {media.map((entry, index) => (
              <button
                aria-current={index === selected}
                aria-label={`${entry.type === "video" ? "Video" : "Photograph"} ${index + 1}`}
                className={`product-detail-thumb${index === selected ? " is-selected" : ""}`}
                key={entry.url}
                onClick={() => setSelected(index)}
                type="button"
              >
                {entry.type === "video" ? (
                  <>
                    <video
                      muted
                      playsInline
                      preload="metadata"
                      src={entry.url}
                    />
                    <span
                      aria-hidden="true"
                      className="product-detail-thumb-play"
                    >
                      ▶
                    </span>
                  </>
                ) : (
                  <Image alt="" fill sizes="80px" src={entry.url} />
                )}
              </button>
            ))}
          </div>
        ) : null}
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
