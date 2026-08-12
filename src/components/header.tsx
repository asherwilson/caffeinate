"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-store";
import { navigation } from "./navigation-items";
import { SocialLinks } from "./social-links";

type HeaderProps = { onOpenTerminal: () => void };

export function Header({ onOpenTerminal }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { count } = useCart();

  /*
   * Publish the header's height as `--header-height`.
   *
   * 🔴 The dropdown has to be `fixed`, because a sticky ancestor does not carry
   * an absolutely positioned child with it — scroll down, open the menu, and it
   * renders at the top of the *document* where nobody can see it. But `fixed`
   * has no way to ask how tall the header is, and the answer changes with the
   * logo size and with text scaling. Measuring it is the only honest source.
   *
   * `ResizeObserver` rather than a one-off read: the bar changes height when
   * the brand scales, when a font finally loads, and on rotate.
   */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  /*
   * Hold the page still while the menu is open.
   *
   * 🔴 Applied to `<html>` rather than `<body>`, and as a class rather than an
   * inline style. iOS Safari ignores `overflow: hidden` on `body` for touch
   * scrolling, and an inline style would fight the class the theme switcher
   * writes to the same element.
   *
   * The cleanup runs on unmount as well as on close, so navigating away with
   * the menu open cannot leave the next page frozen.
   */
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    // Freeze the body where it stands rather than hiding overflow on <html>.
    // Hiding it removes the scrollport that `position: sticky` measures
    // against, so the header fell back to the top of the document and vanished
    // the moment you opened the menu while scrolled down.
    const y = window.scrollY;
    root.style.setProperty("--scroll-lock", `-${y}px`);
    root.classList.add("menu-open");
    return () => {
      root.classList.remove("menu-open");
      root.style.removeProperty("--scroll-lock");
      // Offsetting the body loses the scroll position; put it back exactly.
      window.scrollTo(0, y);
    };
  }, [mobileOpen]);

  const openTerminal = () => {
    setMobileOpen(false);
    onOpenTerminal();
  };

  return (
    <header
      aria-label="Site controls"
      className="site-header"
      ref={headerRef}
      role="toolbar"
    >
      {/* The mark is painted with `currentColor` through a CSS mask rather than
          shipped as two coloured files, because there are eight themes and a
          light/dark pair would be wrong in most of them. */}
      {/* Now the way home, which is why `01 HOME` is gone from the strip: the
          numbered slot and the brand were two routes to the same page, and the
          mark is the one every site trains people to click. The mark alone was
          too small a target to carry that on its own, so the wordmark sits with
          it inside the same link. */}
      <a className="header-brand cursor-pointer" href="/">
        <span aria-hidden="true" className="brand-mark brand-mark-header" />
        CAFFEINATE®
      </a>
      <nav aria-label="Primary navigation" className="desktop-navigation">
        <ol className="navigation-list">
          {navigation.map(([number, label, href]) => (
            <li key={number}>
              {href === "#commands" ? (
                <button
                  className="cursor-pointer"
                  onClick={openTerminal}
                  type="button"
                >
                  {number} {label}
                </button>
              ) : (
                <a className="cursor-pointer" href={href}>
                  {number} {label}
                  {label === "CART"
                    ? ` / ${String(count).padStart(2, "0")}`
                    : ""}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <a className="header-cta cursor-pointer" href="/account">
        GET CAFFEINATED
      </a>

      <div className="mobile-header">
        <a className="mobile-brand cursor-pointer" href="/">
          <span aria-hidden="true" className="brand-mark brand-mark-mobile" />
          CAFFEINATE®
        </a>
        <div className="mobile-controls">
          {/* Icon-only, so the label moves to `aria-label` — otherwise the
              button announces as nothing at all. `aria-controls` ties it to the
              menu it opens, and `aria-expanded` already says which way. */}
          <button
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="menu-toggle cursor-pointer"
            onClick={() => setMobileOpen((value) => !value)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={mobileOpen ? "menu-icon-close" : "menu-icon-bars"}
            />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="mobile-menu"
          id="mobile-menu"
        >
          <p>{"// NAVIGATION / SELECT_DESTINATION"}</p>
          <ol>
            {/* COMMANDS is filtered out rather than styled out. It opens a
                terminal driven by typed input and ⌘K, none of which exists on a
                phone, so offering it here would open a dead end. */}
            {navigation
              .filter(([, , href]) => href !== "#commands")
              .map(([number, label, href]) => (
                <li key={number}>
                  <a className="cursor-pointer" href={href}>
                    <span>{number}</span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
          </ol>

          {/* 🔴 The only route to this on a phone. `.site-header > .header-cta`
              is hidden below 580px, so without it here the primary action on
              the entire site is unreachable on mobile except by finding
              ACCOUNT in the list above. */}
          <a className="mobile-menu-cta cursor-pointer" href="/account">
            GET CAFFEINATED
          </a>

          <div className="mobile-menu-foot">
            <SocialLinks />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
