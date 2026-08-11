import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

export default function ReturnsPage() {
  return (
    <InteriorPage
      description="CLEAR RECOVERY RULES FOR INCORRECT OR DAMAGED OUTPUT."
      eyebrow="// RETURNS / RECOVERY_PROTOCOL"
      title={"RECOVERY MODE."}
    >
      <PageContent
        sections={[
          {
            index: "01 / COFFEE",
            title: "PERISHABLE BY DESIGN.",
            body: (
              <p>
                Opened coffee cannot be returned for preference alone. If the
                coffee or shipment is defective, we will investigate and make it
                right.
              </p>
            ),
          },
          {
            index: "02 / GEAR",
            title: "UNUSED HARDWARE.",
            body: (
              <p>
                Unused, unopened non-perishable goods may be eligible for return
                within thirty days. Return shipping may apply.
              </p>
            ),
          },
          {
            index: "03 / START",
            title: "OPEN A TICKET.",
            body: (
              <p>
                Contact us with the order number before sending anything back.
                Unregistered returns cannot be matched to an account.
              </p>
            ),
          },
        ]}
      />
    </InteriorPage>
  );
}
