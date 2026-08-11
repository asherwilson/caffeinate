import { InteriorPage } from "@/components/interior-page";
import { ProductGrid } from "@/components/product-grid";

export default function ShopPage() {
  return (
    <InteriorPage
      description="COFFEE BUILDS AVAILABLE FOR IMMEDIATE DEPLOYMENT."
      eyebrow="// SHOP / ALL_RELEASES"
      title="AVAILABLE BUILDS."
    >
      <ProductGrid />
    </InteriorPage>
  );
}
