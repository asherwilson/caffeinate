import { CheckoutComplete } from "@/components/checkout-complete";
import { InteriorPage } from "@/components/interior-page";

export default function CheckoutCompletePage() {
  return (
    <InteriorPage
      description="VERIFYING THE PAYMENT DIRECTLY WITH STRIPE."
      eyebrow="CHECKOUT / PAYMENT"
      title="PAYMENT RETURN."
    >
      <CheckoutComplete />
    </InteriorPage>
  );
}
