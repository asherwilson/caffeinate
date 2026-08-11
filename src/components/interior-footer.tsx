import { SiteMap } from "./site-map";

export function InteriorFooter() {
  return (
    <footer className="interior-footer">
      <div className="interior-footer-heading">
        <p>{"// CAFFEINATE® / SITE_INDEX"}</p>
        <h2>STAY AWAKE.</h2>
      </div>
      <SiteMap />
      <div className="interior-footer-bottom">
        <div className="footer-meta">
          <p>© 2026 CAFFEINATE®</p>
          <p>NAV / MOUSE + ARROWS + 01–10 + ⌘K</p>
        </div>
        <p>GOOD COFFEE / BAD SLEEP SCHEDULE</p>
      </div>
    </footer>
  );
}
