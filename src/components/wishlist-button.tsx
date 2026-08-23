"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/components/customer-auth-store";

/**
 * Save this for later.
 *
 * ⚠️ Hidden entirely when nobody is signed in, rather than shown and then
 * refusing. A control that exists only to tell you it does not work for you is
 * a control that should not have been drawn — and a "sign in to save" prompt on
 * every card is an advertisement for the account system, not a shop.
 *
 * 🔴 The list is the SERVER'S. It is deliberately not cached in localStorage
 * beside the cart: a wishlist follows the person to whatever device they are
 * on, and a local copy is a second answer that can disagree with the first.
 */
export function WishlistButton({ catalogItemId }: { catalogItemId: string }) {
  const { listWishlist, removeWishlistItem, saveWishlistItem, session } =
    useCustomerAuth();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) {
      setSaved(null);
      return;
    }
    let cancelled = false;
    listWishlist()
      .then((ids) => {
        if (!cancelled) setSaved(ids.includes(catalogItemId));
      })
      // A wishlist that cannot be read shows nothing rather than a wrong state.
      // Telling somebody an item is unsaved when it is saved makes them save it
      // twice and distrust the feature.
      .catch(() => {
        if (!cancelled) setSaved(null);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogItemId, listWishlist, session]);

  if (!session || saved === null) return null;

  const toggle = async () => {
    setBusy(true);
    // 🔑 Optimistic, and reverted on failure. Saving is not money: the worst
    // case is a heart that flickers, and waiting for a round-trip on a button
    // people press casually feels broken.
    const next = !saved;
    setSaved(next);
    try {
      if (next) await saveWishlistItem(catalogItemId);
      else await removeWishlistItem(catalogItemId);
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      aria-pressed={saved}
      className="cursor-pointer wishlist-button"
      disabled={busy}
      onClick={toggle}
      type="button"
    >
      {saved ? "SAVED" : "SAVE"}
    </button>
  );
}
