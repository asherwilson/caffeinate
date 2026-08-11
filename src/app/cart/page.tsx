import { CartView } from "@/components/cart-view";
import { InteriorPage } from "@/components/interior-page";

export default function CartPage() {
  return (
    <InteriorPage
      description="ITEMS WAITING TO BE COMPILED INTO AN ORDER."
      eyebrow="// CART / PROCESS_QUEUE"
      title="YOUR CART."
    >
      <CartView />
    </InteriorPage>
  );
}
