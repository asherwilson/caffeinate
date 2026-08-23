import { HeroBackdrop } from "./hero-backdrop";
import { LaunchMenu } from "./launch-menu";
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
      <LaunchMenu />
    </main>
  );
}
