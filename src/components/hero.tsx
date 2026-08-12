import { HeroBackdrop } from "./hero-backdrop";
export function Hero() {
  return (
    <main className="hero">
      <HeroBackdrop />
      <section className="hero-intro" aria-labelledby="hero-title">
        <p className="hero-eyebrow">{"// CAFFEINATE® / SMALL-BATCH_COFFEE"}</p>
        <h1 id="hero-title">
          CAFFEINE IS
          <br />A RUNTIME
          <br />
          DEPENDENCY.
        </h1>
        <p className="hero-copy">
          SPECIALTY COFFEE FOR PEOPLE
          <br />
          WITH TOO MANY TABS OPEN.
        </p>
        <div className="hero-actions">
          <a
            className="hero-action hero-action-primary cursor-pointer"
            href="/account"
          >
            GET CAFFEINATED
          </a>
          <a
            className="hero-action secondary-cta cursor-pointer"
            href="/coffee"
          >
            BROWSE THE STACK
          </a>
        </div>
      </section>

      <section className="current-build" aria-labelledby="current-build-title">
        <p id="current-build-title" className="build-label">
          {"// CURRENT_BUILD"}
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
          STATUS / ROASTING=ONLINE / NEXT_DROP=08.16.26 / ORIGIN=CANADA
        </p>
      </section>
    </main>
  );
}
