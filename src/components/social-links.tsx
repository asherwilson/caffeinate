/**
 * Social links, as icons.
 *
 * Each is drawn with a CSS mask in `currentColor`, the same as the brand mark
 * and the menu toggle, so they follow whichever of the eight themes is active
 * instead of being locked to the file's own black.
 *
 * ⚠️ An icon carries no text, so each link holds a visually hidden label.
 * Real text rather than `aria-label`: it survives translation, it is what
 * voice control matches against, and it still reads correctly if the CSS
 * never arrives.
 *
 * To add a platform: drop its name here with the matching file from
 * `public/Icons/SVG/brands/`, and add a `.social-<name>` mask rule in
 * `globals.css`. Available in the pack already: tiktok, twitter, threads,
 * youtube, facebook-round, facebook-square.
 */
/*
 * ⚠️ Every href below is the bare platform, not an account. These must become
 * real handles before launch — a footer icon that lands on a logged-out home
 * page is worse than no icon, because it reads as a brand that abandoned the
 * account.
 */
const socials = [
  { href: "https://instagram.com", label: "Instagram", name: "instagram" },
  { href: "https://tiktok.com", label: "TikTok", name: "tiktok" },
  { href: "https://x.com", label: "X", name: "x" },
  { href: "https://threads.net", label: "Threads", name: "threads" },
] as const;

export function SocialLinks() {
  return (
    <nav aria-label="Social links" className="social-links">
      {socials.map((social) => (
        <a
          className="social-link cursor-pointer"
          href={social.href}
          key={social.name}
          rel="noreferrer noopener"
          target="_blank"
        >
          <span
            aria-hidden="true"
            className={`social-icon social-${social.name}`}
          />
          <span className="visually-hidden">{social.label}</span>
        </a>
      ))}
    </nav>
  );
}
