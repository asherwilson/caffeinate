import { InteriorShell } from "@/components/interior-shell";
import { SystemState } from "@/components/system-state";

export default function NotFound() {
  return (
    <InteriorShell>
      <main className="state-page">
        <SystemState
          action={
            <a className="cursor-pointer" href="/">
              RETURN HOME
            </a>
          }
          code="404"
          description="THE REQUESTED RESOURCE DOES NOT EXIST, MOVED TO A DIFFERENT ADDRESS, OR WAS NEVER DEPLOYED."
          eyebrow="// ROUTE / NOT_FOUND"
          secondaryAction={
            <a className="cursor-pointer" href="/shop">
              BROWSE COFFEE
            </a>
          }
          title="DEAD LINK."
        />
      </main>
    </InteriorShell>
  );
}
