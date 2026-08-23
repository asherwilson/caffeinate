"use client";

import { useState } from "react";
import { BackgroundProcess } from "./background-process";
import { BrewProtocol } from "./brew-protocol";
import { FeaturedRelease } from "./featured-release";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { useSpatialNavigation } from "./spatial-navigation";
import { Terminal } from "./terminal";

/**
 * 🔴 The same navigation as every other page.
 *
 * The home page used to run a hand-authored map of a hundred numbered targets,
 * each wiring its own up/down/left/right, spread across eight components as
 * forty-seven hardcoded indices. Anything nobody remembered to number was
 * simply unreachable, the behaviour drifted from the interior pages, and
 * sliding between pages worked everywhere except here.
 *
 * Spatial navigation derives all of that from the layout instead, so a new
 * paragraph is reachable the moment it exists.
 */
export function SiteShell() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const navigationRef = useSpatialNavigation();

  return (
    <div className="site-shell" ref={navigationRef}>
      <Header onOpenTerminal={() => setTerminalOpen(true)} />
      <Hero />
      {/*
       * 🔴 A hardcoded grid of three coffees used to render HERE, on every
       * page of the site, above the real content. That is what a shopper
       * actually saw: fake products with fake prices, a fake weight and a
       * stock photograph, each linking to a slug the catalog never had.
       *
       * The home page lists real products through `LaunchMenu`, and the
       * shop page lists all of them through `ProductGrid`. Neither needs a
       * second copy drawn from a file.
       */}
      <FeaturedRelease />
      <BrewProtocol />
      <BackgroundProcess />
      <Footer />
      <Terminal
        onClose={() => setTerminalOpen(false)}
        onOpen={() => setTerminalOpen(true)}
        open={terminalOpen}
      />
    </div>
  );
}
