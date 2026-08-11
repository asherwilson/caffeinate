import { AccountAccess } from "@/components/account-access";
import { InteriorPage } from "@/components/interior-page";

export default function AccountPage() {
  return (
    <InteriorPage
      description="ONE EMAIL OR GOOGLE IDENTITY. NO PASSWORD TO REMEMBER."
      eyebrow="// ACCOUNT / PASSWORDLESS_ACCESS"
      title="GET CAFFEINATED."
    >
      <AccountAccess />
    </InteriorPage>
  );
}
