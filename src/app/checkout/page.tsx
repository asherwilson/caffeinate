import { CheckoutFlow } from "@/components/checkout-flow";
import { InteriorPage } from "@/components/interior-page";

export default function CheckoutPage() {
  return (
    <InteriorPage
      description="VERIFY THE PAYLOAD BEFORE THE ORDER IS COMMITTED."
      eyebrow="// CHECKOUT / ORDER_COMPILER"
      title="CHECKOUT."
    >
      <CheckoutFlow />
    </InteriorPage>
  );
}
