import { InteriorPage } from "@/components/interior-page";
import { ProductGrid } from "@/components/product-grid";

export default function CoffeePage() {
  return (
    <InteriorPage
      description="SMALL-BATCH COFFEE FOR PEOPLE WITH TOO MANY TABS OPEN."
      eyebrow="// COFFEE / CURRENT_CATALOG"
      title="COFFEE."
    >
      <ProductGrid />
    </InteriorPage>
  );
}
