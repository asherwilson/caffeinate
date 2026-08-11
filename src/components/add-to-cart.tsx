"use client";

import { useState } from "react";
import { useCart } from "./cart-store";
import { useCatalog } from "./catalog-store";
import { useToast } from "./toast-store";

export function AddToCart({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const { availabilityFor, findProduct, loading } = useCatalog();
  const { pushToast } = useToast();
  const [added, setAdded] = useState(false);
  const product = findProduct(slug);
  const availability = product
    ? availabilityFor(product.catalogItemId)
    : undefined;
  const soldOut = Boolean(availability && !availability.available);

  return (
    <button
      className="cursor-pointer"
      disabled={loading || !product || soldOut}
      onClick={() => {
        if (!product) return;
        addItem(product.catalogItemId);
        pushToast({
          code: "CART+1",
          message: "COFFEE ADDED TO PROCESS QUEUE.",
          tone: "success",
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      type="button"
    >
      {loading
        ? "CHECKING..."
        : soldOut
          ? "SOLD OUT"
          : added
            ? "ADDED"
            : "ADD TO CART"}
    </button>
  );
}
