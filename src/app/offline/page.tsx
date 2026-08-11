import { InteriorShell } from "@/components/interior-shell";
import { SystemState } from "@/components/system-state";

export default function OfflinePage() {
  return (
    <InteriorShell>
      <main className="state-page">
        <SystemState
          action={
            <a className="cursor-pointer" href="/offline">
              RETRY CONNECTION
            </a>
          }
          code="OFFLINE"
          description="NO NETWORK CONNECTION IS AVAILABLE. CHECK THE SIGNAL, THEN RETRY. CART DATA ALREADY STORED ON THIS DEVICE SHOULD REMAIN AVAILABLE."
          eyebrow="// NETWORK / CONNECTION_LOST"
          secondaryAction={
            <a className="cursor-pointer" href="/">
              RETURN HOME
            </a>
          }
          title="SIGNAL LOST."
        />
      </main>
    </InteriorShell>
  );
}
