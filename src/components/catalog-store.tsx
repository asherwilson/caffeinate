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
import {
  fallbackProducts,
  presentationFor,
  productSlug,
  type StoreProduct,
} from "@/lib/products";
import { quickDashClient, quickDashConfigured } from "@/lib/quickdash";

type CatalogContextValue = {
  availabilityFor: (
    catalogItemId: string,
  ) => QuickCatalogAvailability | undefined;
  connected: boolean;
  findProduct: (slug: string) => StoreProduct | undefined;
  findProductById: (catalogItemId: string) => StoreProduct | undefined;
  loading: boolean;
  products: StoreProduct[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(
    quickDashConfigured ? [] : fallbackProducts,
  );
  const [loading, setLoading] = useState(quickDashConfigured);
  const [connected, setConnected] = useState(false);
  const [availability, setAvailability] = useState<
    Map<string, QuickCatalogAvailability>
  >(new Map());

  useEffect(() => {
    if (!quickDashConfigured) return;

    const client = quickDashClient();
    client.catalog
      .list({ limit: 100 })
      .then(async ({ data }) => {
        const liveProducts = data.items.flatMap((item) => {
          if (item.priceCents === null) return [];
          const slug = productSlug(item.name);
          const presentation = presentationFor(slug);
          return [
            {
              catalogItemId: item.id,
              currency: item.currency,
              description:
                item.description ?? presentation?.description ?? item.name,
              image: presentation?.image ?? "/images/image-1.jpg",
              name: item.name,
              priceCents: item.priceCents,
              roast: presentation?.roast ?? "COFFEE",
              sku: item.sku,
              slug,
              weightGrams: item.weightGrams,
            },
          ];
        });
        const { data: liveAvailability } = await client.site.availability(
          liveProducts.map((product) => product.catalogItemId),
        );
        setProducts(liveProducts);
        setAvailability(
          new Map(liveAvailability.map((item) => [item.catalogItemId, item])),
        );
        setConnected(true);
      })
      .catch(() => {
        setProducts([]);
        setAvailability(new Map());
        setConnected(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      availabilityFor: (catalogItemId) => availability.get(catalogItemId),
      connected,
      findProduct: (slug) => products.find((product) => product.slug === slug),
      findProductById: (catalogItemId) =>
        products.find((product) => product.catalogItemId === catalogItemId),
      loading,
      products,
    }),
    [availability, connected, loading, products],
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
