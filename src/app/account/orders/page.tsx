import { InteriorPage } from "@/components/interior-page";
import { OrderHistory } from "@/components/order-history";

export default function OrdersPage() {
  return (
    <InteriorPage
      description="TRACK ACTIVE SHIPMENTS AND INSPECT PREVIOUS DEPLOYMENTS."
      eyebrow="// ORDERS / CUSTOMER_HISTORY"
      title="ORDER LOG."
    >
      <OrderHistory />
    </InteriorPage>
  );
}
