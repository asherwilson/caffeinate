"use client";

import type { QuickCatalogAvailability } from "@quickengine/quick/browser";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { subscribeToCatalog } from "@/lib/catalog-live";
import { productSlug, roastFromTags, type StoreProduct } from "@/lib/products";
import { quickDashClient, quickDashConfigured } from "@/lib/quickdash";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  itemCount: number;
};

type CatalogContextValue = {
  availabilityFor: (
    catalogItemId: string,
  ) => QuickCatalogAvailability | undefined;
  /**
   * The categories a shopper may browse by, from QuickDash.
   *
   * ⚠️ Only visible ones with something in them. A category a business created
   * and never filled is not a section of a shop, it is a note to themselves,
   * and showing it produces a click that leads to an empty page.
   */
  categories: StoreCategory[];
  /** Which products are in a category, by slug. Empty until asked. */
  productsInCategory: (slug: string) => StoreProduct[] | undefined;
  connected: boolean;
  findProduct: (slug: string) => StoreProduct | undefined;
  findProductById: (catalogItemId: string) => StoreProduct | undefined;
  loading: boolean;
  products: StoreProduct[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  /**
   * 🔴 Starts EMPTY, always.
   *
   * It used to start with three hardcoded coffees whenever QuickDash was not
   * configured, which meant a misconfigured storefront looked like a working
   * one selling products that do not exist. An empty shop that says so is the
   * honest failure; a fake shop is the dangerous one.
   */
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(quickDashConfigured);
  const [connected, setConnected] = useState(false);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoryItems, setCategoryItems] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [availability, setAvailability] = useState<
    Map<string, QuickCatalogAvailability>
  >(new Map());

  useEffect(() => {
    if (!quickDashConfigured) return;

    const client = quickDashClient();
    // Set once the component unmounts, so a refetch that is already in flight
    // cannot write state into a store nobody is showing any more.
    let stopped = false;

    const load = () =>
      client.catalog
        .list({ limit: 100 })
        .then(async ({ data }) => {
          const liveProducts = data.items.flatMap((item) => {
            if (item.priceCents === null) return [];
            const metadata = (item.metadata ?? {}) as {
              slug?: unknown;
              featured?: unknown;
              tags?: unknown;
              images?: unknown;
              compareAtPriceCents?: unknown;
            };
            /**
             * 🔴 The catalog's OWN slug wins.
             *
             * Deriving it from the name is only a fallback for a product that has
             * never been given one: a derived slug changes the moment somebody
             * renames a product, silently breaking every link a customer saved.
             */
            const slug =
              typeof metadata.slug === "string" && metadata.slug.trim()
                ? metadata.slug.trim()
                : productSlug(item.name);
            const images = Array.isArray(metadata.images)
              ? metadata.images
              : [];
            const image =
              typeof images[0] === "string" && images[0].trim()
                ? images[0]
                : null;
            return [
              {
                catalogItemId: item.id,
                compareAtPriceCents:
                  typeof metadata.compareAtPriceCents === "number"
                    ? metadata.compareAtPriceCents
                    : null,
                currency: item.currency,
                description: item.description ?? item.name,
                featured: metadata.featured === true,
                image,
                name: item.name,
                priceCents: item.priceCents,
                roast: roastFromTags(metadata.tags),
                sku: item.sku,
                slug,
                unitLabel: item.unitLabel ?? null,
                weightGrams: item.weightGrams,
              },
            ];
          });
          const { data: liveAvailability } = await client.site.availability(
            liveProducts.map((product) => product.catalogItemId),
          );
          /**
           * 🔴 Fetched with the catalog, not on demand.
           *
           * A shopper who lands on a category link should not watch a second
           * spinner after the first one finishes. There are rarely more than a
           * few dozen categories and the response is small.
           *
           * ⚠️ Failure here must not take the CATALOG down with it. A shop with
           * no browsing sections still sells; a shop with no products does not.
           */
          try {
            const { data: liveCategories } = await client.site.listCategories();
            const visible = liveCategories.items.filter(
              (category) => category.visible && category.itemCount > 0,
            );
            setCategories(
              visible.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
                description:
                  typeof category.description === "string"
                    ? category.description
                    : null,
                itemCount: category.itemCount,
              })),
            );
            const memberships = await Promise.all(
              visible.map(async (category) => {
                const { data } = await client.site.listCategoryItems(
                  category.slug,
                );
                return [category.slug, data.itemIds] as const;
              }),
            );
            setCategoryItems(new Map(memberships));
          } catch {
            setCategories([]);
            setCategoryItems(new Map());
          }

          setProducts(liveProducts);
          setAvailability(
            new Map(liveAvailability.map((item) => [item.catalogItemId, item])),
          );
          setConnected(true);
        })
        .catch(() => {
          if (stopped) return;
          setProducts([]);
          setAvailability(new Map());
          setConnected(false);
        })
        .finally(() => {
          if (!stopped) setLoading(false);
        });

    void load();

    /**
     * Refetch when the catalog changes, rather than on a timer.
     *
     * ⚠️ Debounced because one operator action can fire several events: saving a
     * product touches the item and its stock, and a bulk import fires a burst.
     * Without this the shop would refetch its whole catalog once per event.
     */
    let pending: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeToCatalog(client, {
      onChange: () => {
        if (stopped) return;
        clearTimeout(pending);
        pending = setTimeout(() => {
          if (!stopped) void load();
        }, 300);
      },
    });

    return () => {
      stopped = true;
      clearTimeout(pending);
      void unsubscribe.then((stop) => stop());
    };
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      availabilityFor: (catalogItemId) => availability.get(catalogItemId),
      categories,
      connected,
      productsInCategory: (slug: string) => {
        const ids = categoryItems.get(slug);
        if (!ids) return undefined;
        const inCategory = new Set(ids);
        return products.filter((product) =>
          inCategory.has(product.catalogItemId),
        );
      },
      findProduct: (slug) => products.find((product) => product.slug === slug),
      findProductById: (catalogItemId) =>
        products.find((product) => product.catalogItemId === catalogItemId),
      loading,
      products,
    }),
    /**
     * ⚠️ `categories` and `categoryItems` belong here even though the screen
     * looks right without them.
     *
     * They are set in the same handler as `products`, so React batches the
     * updates and the memo happens to recompute with fresh values. That is an
     * accident of timing, not a guarantee — the day categories load from their
     * own request they would never appear at all, and nothing about the code
     * would look wrong.
     */
    [availability, categories, categoryItems, connected, loading, products],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
