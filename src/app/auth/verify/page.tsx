import { Suspense } from "react";
import { AuthVerify } from "@/components/auth-verify";
import { InteriorPage } from "@/components/interior-page";

export default function VerifyPage() {
  return (
    <InteriorPage
      description="ONE LINK. ONE USE. NO PASSWORD."
      eyebrow="// ACCOUNT / VERIFY_SIGNAL"
      title="OPENING SESSION."
    >
      <Suspense fallback={null}>
        <AuthVerify />
      </Suspense>
    </InteriorPage>
  );
}
