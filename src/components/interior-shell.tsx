"use client";

import { type ReactNode, useState } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { useSpatialNavigation } from "./spatial-navigation";
import { Terminal } from "./terminal";

export function InteriorShell({ children }: { children: ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const navigationRef = useSpatialNavigation();

  return (
    <div className="interior-shell" ref={navigationRef}>
      <Header onOpenTerminal={() => setTerminalOpen(true)} />
      {children}
      {/* The same footer the home page uses. There was a second, thinner
          `InteriorFooter` here — no callout, no CTA, no socials, and still
          carrying the nav-hint line that was removed from the real one. Two
          footers meant every footer change had to be made twice, and the
          second one silently drifted. */}
      <Footer />
      <Terminal
        onClose={() => setTerminalOpen(false)}
        onOpen={() => setTerminalOpen(true)}
        open={terminalOpen}
      />
    </div>
  );
}
