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
