import { SiteMap } from "./site-map";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-callout" aria-labelledby="footer-title">
          <p className="footer-eyebrow">
            {"// CAFFEINATE® / END_OF_TRANSMISSION"}
          </p>
          <h2 id="footer-title">
            STAY
            <br />
            AWAKE.
          </h2>
          <p className="footer-copy">
            GOOD COFFEE.
            <br />
            BAD SLEEP SCHEDULE.
          </p>
          <a className="footer-action cursor-pointer" href="/account">
            GET CAFFEINATED
          </a>
        </section>

        <section className="footer-system" aria-labelledby="system-title">
          <p id="system-title">% system_status</p>
          <p>
            <span>STATUS /</span>
            <span>OPERATIONAL</span>
          </p>
          <p>
            <span>ROASTING /</span>
            <span>CANADA</span>
          </p>
          <p>
            <span>SUPPORT /</span>
            <span>HUMAN</span>
          </p>
          <p>
            <span>BUILD /</span>
            <span>2026.08.09</span>
          </p>
        </section>
      </div>

      <div className="footer-map">
        <p className="footer-map-label">{"// SITE_INDEX / ALL_DESTINATIONS"}</p>
        <SiteMap />
      </div>

      <div className="footer-bottom">
        <div className="footer-meta">
          <p>© 2026 CAFFEINATE®</p>
          <p>NAV / MOUSE + ARROWS + 01–10 + ⌘K</p>
        </div>
        <nav aria-label="Footer navigation">
          <a className="cursor-pointer" href="/shipping">
            SHIPPING
          </a>
          <a className="cursor-pointer" href="/returns">
            RETURNS
          </a>
          <a className="cursor-pointer" href="/privacy">
            PRIVACY
          </a>
          <a className="cursor-pointer" href="/terms">
            TERMS
          </a>
          <a className="cursor-pointer" href="/contact">
            CONTACT
          </a>
          <a className="cursor-pointer" href="https://instagram.com">
            INSTAGRAM
          </a>
        </nav>
      </div>
    </footer>
  );
}
