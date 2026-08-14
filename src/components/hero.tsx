import { HeroBackdrop } from "./hero-backdrop";
export function Hero() {
  return (
    <main className="hero">
      <HeroBackdrop />
      <section className="hero-intro" aria-labelledby="hero-title">
        <p className="hero-eyebrow">
          {"// SPECIALTY_COFFEE / ROASTED_IN_CANADA"}
        </p>
        <h1 id="hero-title">
          COFFEE FOR
          <br />
          LONG
          <br />
          SESSIONS.
        </h1>
        <p className="hero-copy">
          TRACEABLE, SMALL-BATCH COFFEE
          <br />
          FOR PEOPLE WHO BUILD THINGS.
        </p>
        <div className="hero-actions">
          <a
            className="hero-action hero-action-primary cursor-pointer"
            href="/coffee"
          >
            SHOP COFFEE
          </a>
          <a
            className="hero-action secondary-cta cursor-pointer"
            href="/coffee"
          >
            FIND YOUR ROAST
          </a>
        </div>
      </section>

      <section className="current-build" aria-labelledby="current-build-title">
        <p id="current-build-title" className="build-label">
          {"// LAUNCH_MENU"}
        </p>
        <a className="cursor-pointer" href="/coffee/house-process">
          <span>01 HOUSE PROCESS</span>
          <span>CHOCOLATE / CARAMEL / PANIC</span>
        </a>
        <a className="cursor-pointer" href="/coffee/dark-mode">
          <span>02 DARK MODE</span>
          <span>SMOKE / COCOA / BAD DECISIONS</span>
        </a>
        <a className="cursor-pointer" href="/coffee/hotfix">
          <span>03 HOTFIX</span>
          <span>CITRUS / HONEY / 4:37 AM</span>
        </a>
        <p className="build-status">
          STATUS / THREE_ROASTS / 250G / WHOLE_BEAN
        </p>
      </section>
    </main>
  );
}
