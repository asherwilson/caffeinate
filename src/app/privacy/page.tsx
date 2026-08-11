import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

export default function PrivacyPage() {
  return (
    <InteriorPage
      description="THE MINIMUM DATA REQUIRED TO PROCESS THE REQUEST."
      eyebrow="// PRIVACY / DATA_POLICY"
      title={"PRIVATE BY DEFAULT."}
    >
      <PageContent
        sections={[
          {
            index: "01 / COLLECTION",
            title: "ONLY USEFUL INPUT.",
            body: (
              <p>
                We collect information needed to operate accounts, fulfill
                purchases, prevent abuse, and answer support requests.
              </p>
            ),
          },
          {
            index: "02 / PROCESSORS",
            title: "LIMITED SUBSYSTEMS.",
            body: (
              <p>
                Payment, delivery, analytics, and infrastructure providers
                receive only the information required to perform their function.
              </p>
            ),
          },
          {
            index: "03 / CONTROL",
            title: "REQUEST ACCESS OR DELETION.",
            body: (
              <p>
                Contact us to request a copy, correction, or deletion of
                eligible personal information. Legal and fraud-prevention
                retention may still apply.
              </p>
            ),
          },
        ]}
      />
    </InteriorPage>
  );
}
