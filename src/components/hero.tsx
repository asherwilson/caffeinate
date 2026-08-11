import type { DirectionalNavigation } from "./directional-navigation";

type HeroProps = Pick<DirectionalNavigation, "targetProps">;

export function Hero({ targetProps }: HeroProps) {
  return (
    <main className="hero">
      <section className="hero-intro" aria-labelledby="hero-title">
        <p className="hero-eyebrow" {...targetProps(11)}>
          {"// CAFFEINATE® / SMALL-BATCH_COFFEE"}
        </p>
        <h1 id="hero-title" {...targetProps(12)}>
          CAFFEINE IS
          <br />A RUNTIME
          <br />
          DEPENDENCY.
        </h1>
        <p className="hero-copy" {...targetProps(13)}>
          SPECIALTY COFFEE FOR PEOPLE
          <br />
          WITH TOO MANY TABS OPEN.
        </p>
        <div className="hero-actions">
          <a
            className="hero-action hero-action-primary cursor-pointer"
            href="/account"
            {...targetProps(14)}
          >
            GET CAFFEINATED
          </a>
          <a
            className="hero-action secondary-cta cursor-pointer"
            href="/coffee"
            {...targetProps(15)}
          >
            BROWSE THE STACK
          </a>
        </div>
      </section>

      <section className="current-build" aria-labelledby="current-build-title">
        <p
          id="current-build-title"
          className="build-label"
          {...targetProps(16)}
        >
          {"// CURRENT_BUILD"}
        </p>
        <a
          className="cursor-pointer"
          href="/coffee/house-process"
          {...targetProps(17)}
        >
          <span>01 HOUSE PROCESS</span>
          <span>CHOCOLATE / CARAMEL / PANIC</span>
        </a>
        <a
          className="cursor-pointer"
          href="/coffee/dark-mode"
          {...targetProps(18)}
        >
          <span>02 DARK MODE</span>
          <span>SMOKE / COCOA / BAD DECISIONS</span>
        </a>
        <a
          className="cursor-pointer"
          href="/coffee/hotfix"
          {...targetProps(19)}
        >
          <span>03 HOTFIX</span>
          <span>CITRUS / HONEY / 4:37 AM</span>
        </a>
        <p className="build-status" {...targetProps(20)}>
          STATUS / ROASTING=ONLINE / NEXT_DROP=08.16.26 / ORIGIN=CANADA
        </p>
      </section>
    </main>
  );
}
