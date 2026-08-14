import { SiteMap } from "./site-map";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-callout" aria-labelledby="footer-title">
          <p className="footer-eyebrow">
            {"// CAFFEINATE® / SPECIALTY_COFFEE"}
          </p>
          <h2 id="footer-title">
            STAY
            <br />
            AWAKE.
          </h2>
          <p className="footer-copy">
            SMALL-BATCH COFFEE.
            <br />
            BUILT FOR LONG SESSIONS.
          </p>
          <a className="footer-action cursor-pointer" href="/coffee">
            SHOP COFFEE
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

      {/* The row of SHIPPING / RETURNS / PRIVACY / TERMS / CONTACT / INSTAGRAM
          that used to sit here is gone — every one of those already has an entry
          in the site map directly above, so it was the same six links twice on
          one screen. */}
      <div className="footer-bottom">
        {/* The NAV / MOUSE + ARROWS + 01–10 + ⌘K line is gone. The floating
            `NavigationHint` already teaches those controls, and it knows not to
            appear on a device that has none of them. */}
        <p className="footer-copyright">© 2026 CAFFEINATE®</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
