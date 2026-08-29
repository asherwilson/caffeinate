"use client";

import { useContent } from "./content-store";
import { HeroBackdrop } from "./hero-backdrop";
import { LaunchMenu } from "./launch-menu";

/**
 * 🔑 Every word here is a content slot with this site's original copy as its
 * fallback, so the page renders identically to before until somebody changes
 * something — and then changes without a deploy.
 *
 * ⚠️ `whitespace-pre-line` on the headline and supporting line: the line breaks
 * used to be `<br />` tags in this file, which meant only a developer could
 * decide where the words wrap. As a slot they are newlines the owner types.
 */
export function Hero() {
  const content = useContent();

  return (
    <main className="hero">
      <HeroBackdrop />
      <section className="hero-intro" aria-labelledby="hero-title">
        <p className="hero-eyebrow">{content("home.hero.eyebrow")}</p>
        <h1 id="hero-title" style={{ whiteSpace: "pre-line" }}>
          {content("home.hero.headline")}
        </h1>
        <p className="hero-copy" style={{ whiteSpace: "pre-line" }}>
          {content("home.hero.copy")}
        </p>
        <div className="hero-actions">
          <a
            className="hero-action hero-action-primary cursor-pointer"
            href="/coffee"
          >
            {content("home.hero.primary-cta")}
          </a>
          <a
            className="hero-action secondary-cta cursor-pointer"
            href="/coffee"
          >
            {content("home.hero.secondary-cta")}
          </a>
        </div>
      </section>
      <LaunchMenu />
    </main>
  );
}
