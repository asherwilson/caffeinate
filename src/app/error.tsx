"use client";

import { useEffect } from "react";
import { InteriorShell } from "@/components/interior-shell";
import { SystemState } from "@/components/system-state";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <InteriorShell>
      <main className="state-page">
        <SystemState
          action={
            <button className="cursor-pointer" onClick={reset} type="button">
              RETRY PROCESS
            </button>
          }
          code={error.digest ? `500 / ${error.digest}` : "500"}
          description="AN UNEXPECTED PROCESS FAILED. YOUR INPUT WAS NOT INTENTIONALLY DISCARDED. RETRY THE REQUEST OR RETURN TO A STABLE ROUTE."
          eyebrow="// SYSTEM / PROCESS_FAILURE"
          secondaryAction={
            <a className="cursor-pointer" href="/">
              RETURN HOME
            </a>
          }
          title="PROCESS FAILED."
        />
      </main>
    </InteriorShell>
  );
}
