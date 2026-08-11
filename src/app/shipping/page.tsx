import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

export default function ShippingPage() {
  return (
    <InteriorPage
      description="ROASTED, PACKED, AND DISPATCHED WITH A TRACEABLE ROUTE."
      eyebrow="// SHIPPING / DELIVERY_PROTOCOL"
      title={"DELIVERY PROTOCOL."}
    >
      <PageContent
        sections={[
          {
            index: "01 / PROCESS",
            title: "ROAST THEN ROUTE.",
            body: (
              <p>
                Orders enter the next available roast and fulfillment cycle.
                Tracking is transmitted when the carrier accepts the package.
              </p>
            ),
          },
          {
            index: "02 / COVERAGE",
            title: "CANADA FIRST.",
            body: (
              <p>
                Initial service covers Canadian addresses. Rates and delivery
                estimates are calculated at checkout from the actual
                destination.
              </p>
            ),
          },
          {
            index: "03 / DAMAGE",
            title: "REPORT A BAD PACKET.",
            body: (
              <p>
                If a shipment arrives damaged or incorrect, send the order
                number and photographs through Contact within seven days.
              </p>
            ),
          },
        ]}
      />
    </InteriorPage>
  );
}
