import type { DirectionalNavigation } from "./directional-navigation";
import { SiteMap } from "./site-map";

type FooterProps = Pick<DirectionalNavigation, "targetProps">;

export function Footer({ targetProps }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-callout" aria-labelledby="footer-title">
          <p className="footer-eyebrow" {...targetProps(21)}>
            {"// CAFFEINATE® / END_OF_TRANSMISSION"}
          </p>
          <h2 id="footer-title" {...targetProps(22)}>
            STAY
            <br />
            AWAKE.
          </h2>
          <p className="footer-copy" {...targetProps(23)}>
            GOOD COFFEE.
            <br />
            BAD SLEEP SCHEDULE.
          </p>
          <a
            className="footer-action cursor-pointer"
            href="/account"
            {...targetProps(24)}
          >
            GET CAFFEINATED
          </a>
        </section>

        <section className="footer-system" aria-labelledby="system-title">
          <p id="system-title" {...targetProps(25)}>
            % system_status
          </p>
          <p {...targetProps(26)}>
            <span>STATUS /</span>
            <span>OPERATIONAL</span>
          </p>
          <p {...targetProps(27)}>
            <span>ROASTING /</span>
            <span>CANADA</span>
          </p>
          <p {...targetProps(28)}>
            <span>SUPPORT /</span>
            <span>HUMAN</span>
          </p>
          <p {...targetProps(29)}>
            <span>BUILD /</span>
            <span>2026.08.09</span>
          </p>
        </section>
      </div>

      <div className="footer-map">
        <p className="footer-map-label" {...targetProps(86)}>
          {"// SITE_INDEX / ALL_DESTINATIONS"}
        </p>
        <SiteMap getTargetProps={targetProps} startIndex={87} />
      </div>

      <div className="footer-bottom">
        <div className="footer-meta">
          <p {...targetProps(30)}>© 2026 CAFFEINATE®</p>
          <p>NAV / MOUSE + ARROWS + 01–10 + ⌘K</p>
        </div>
        <nav aria-label="Footer navigation">
          <a className="cursor-pointer" href="/shipping" {...targetProps(31)}>
            SHIPPING
          </a>
          <a className="cursor-pointer" href="/returns" {...targetProps(32)}>
            RETURNS
          </a>
          <a className="cursor-pointer" href="/privacy" {...targetProps(33)}>
            PRIVACY
          </a>
          <a className="cursor-pointer" href="/contact" {...targetProps(34)}>
            CONTACT
          </a>
          <a
            className="cursor-pointer"
            href="https://instagram.com"
            {...targetProps(35)}
          >
            INSTAGRAM
          </a>
        </nav>
      </div>
    </footer>
  );
}
