"use client";

import { type ReactNode, useState } from "react";
import { Header } from "./header";
import { InteriorFooter } from "./interior-footer";
import { useSpatialNavigation } from "./spatial-navigation";
import { Terminal } from "./terminal";

export function InteriorShell({ children }: { children: ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const navigationRef = useSpatialNavigation();

  return (
    <div className="interior-shell" ref={navigationRef}>
      <Header onOpenTerminal={() => setTerminalOpen(true)} />
      {children}
      <InteriorFooter />
      <Terminal
        onClose={() => setTerminalOpen(false)}
        onOpen={() => setTerminalOpen(true)}
        open={terminalOpen}
      />
    </div>
  );
}
