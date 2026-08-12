import { CustomerMessages } from "@/components/customer-messages";
import { InteriorPage } from "@/components/interior-page";

export default function MessagesPage() {
  return (
    <InteriorPage
      description="TALK TO THE ROASTER ABOUT AN ORDER WITHOUT LEAVING YOUR ACCOUNT."
      eyebrow="// MESSAGES / CUSTOMER_THREAD"
      title="MESSAGES."
    >
      <CustomerMessages />
    </InteriorPage>
  );
}
