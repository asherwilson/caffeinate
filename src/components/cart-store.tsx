"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { migrateBrowserValue } from "@/lib/browser-storage";
import { useCatalog } from "./catalog-store";

type StoredCartItem = {
  catalogItemId: string;
  quantity: number;
};

type CartContextValue = {
  addItem: (catalogItemId: string) => void;
  clear: () => void;
  count: number;
  items: StoredCartItem[];
  removeItem: (catalogItemId: string) => void;
  updateQuantity: (catalogItemId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "caffeinate-cart-v2";
const legacyStorageKey = "caffeinated-cart-v2";

function validStoredItems(value: unknown): StoredCartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is StoredCartItem =>
      typeof item === "object" &&
      item !== null &&
      typeof item.catalogItemId === "string" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 12,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setItems(
        validStoredItems(
          JSON.parse(migrateBrowserValue(storageKey, legacyStorageKey) ?? "[]"),
        ),
      );
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hydrated, items]);

  /**
   * Drop lines whose product no longer exists in the catalog.
   *
   * 🔴 The header counted RAW stored lines while every page that renders a
   * basket counted only the lines it could resolve against the live catalog.
   * A cart holding products from a workspace that no longer exists therefore
   * read "CART / 03" over a visibly empty basket — and the same divergence
   * appears for any shopper whose saved item is later deleted or archived.
   * The store is the only place that can settle it, because it is the only
   * thing both the header and the pages agree to read.
   *
   * ⚠️ Guarded three ways, because the failure mode of over-eager pruning is
   * emptying somebody's real basket:
   *   - not before hydration, or it prunes against an empty cart
   *   - not while the catalog is loading, or it prunes against nothing
   *   - not when the catalog came back EMPTY, which is indistinguishable here
   *     from a failed fetch or a shop that has not published yet
   *
   * Returns `current` untouched when nothing was removed. A fresh array every
   * pass would rewrite localStorage on every render through the effect above.
   */
  const { loading: catalogLoading, products } = useCatalog();
  useEffect(() => {
    if (!hydrated || catalogLoading || products.length === 0) return;
    setItems((current) => {
      const known = new Set(products.map((product) => product.catalogItemId));
      const next = current.filter((item) => known.has(item.catalogItemId));
      return next.length === current.length ? current : next;
    });
  }, [hydrated, catalogLoading, products]);

  const value = useMemo<CartContextValue>(
    () => ({
      addItem: (catalogItemId) =>
        setItems((current) => {
          const existing = current.find(
            (item) => item.catalogItemId === catalogItemId,
          );
          if (existing) {
            return current.map((item) =>
              item.catalogItemId === catalogItemId
                ? { ...item, quantity: Math.min(12, item.quantity + 1) }
                : item,
            );
          }
          return [...current, { catalogItemId, quantity: 1 }];
        }),
      clear: () => setItems([]),
      count: items.reduce((total, item) => total + item.quantity, 0),
      items,
      removeItem: (catalogItemId) =>
        setItems((current) =>
          current.filter((item) => item.catalogItemId !== catalogItemId),
        ),
      updateQuantity: (catalogItemId, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.catalogItemId !== catalogItemId)
            : current.map((item) =>
                item.catalogItemId === catalogItemId
                  ? { ...item, quantity: Math.min(12, quantity) }
                  : item,
              ),
        ),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
