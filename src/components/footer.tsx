"use client";

import { useContent } from "./content-store";
import { SiteMap } from "./site-map";
import { SocialLinks } from "./social-links";

export function Footer() {
  const content = useContent();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-callout" aria-labelledby="footer-title">
          <p className="footer-eyebrow">{content("footer.label")}</p>
          <h2 id="footer-title" style={{ whiteSpace: "pre-line" }}>
            {content("footer.title")}
          </h2>
          <p className="footer-copy" style={{ whiteSpace: "pre-line" }}>
            {content("footer.copy")}
          </p>
          <a className="footer-action cursor-pointer" href="/coffee">
            {content("footer.cta")}
          </a>
        </section>

        <section className="footer-system" aria-labelledby="system-title">
          <p id="system-title">% system_status</p>
          <p>
            <span>STATUS /</span>
            <span>{content("footer.status")}</span>
          </p>
          <p>
            <span>ROASTING /</span>
            <span>{content("footer.roasting")}</span>
          </p>
          <p>
            <span>SUPPORT /</span>
            <span>{content("footer.support")}</span>
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
