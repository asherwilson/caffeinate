"use client";

import { useState } from "react";
import { BackgroundProcess } from "./background-process";
import { BrewProtocol } from "./brew-protocol";
import { Catalog } from "./catalog";
import { useDirectionalNavigation } from "./directional-navigation";
import { FeaturedRelease } from "./featured-release";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { Terminal } from "./terminal";

export function SiteShell() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const navigation = useDirectionalNavigation();

  return (
    <div className="site-shell">
      <Header
        onOpenTerminal={() => setTerminalOpen(true)}
        onSelect={navigation.select}
        register={navigation.register}
        selected={navigation.selected}
        wall={navigation.wall}
      />
      <Hero targetProps={navigation.targetProps} />
      <Catalog targetProps={navigation.targetProps} />
      <FeaturedRelease targetProps={navigation.targetProps} />
      <BrewProtocol targetProps={navigation.targetProps} />
      <BackgroundProcess targetProps={navigation.targetProps} />
      <Footer targetProps={navigation.targetProps} />
      <Terminal
        onClose={() => setTerminalOpen(false)}
        onOpen={() => setTerminalOpen(true)}
        open={terminalOpen}
      />
    </div>
  );
}
