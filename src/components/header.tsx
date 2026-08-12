"use client";

import { useEffect, useState } from "react";
import { useCart } from "./cart-store";
import { navigation } from "./navigation-items";

type HeaderProps = { onOpenTerminal: () => void };

export function Header({ onOpenTerminal }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const openTerminal = () => {
    setMobileOpen(false);
    onOpenTerminal();
  };

  return (
    <header aria-label="Site controls" className="site-header" role="toolbar">
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
              {number === "10" ? (
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
          <a className="cursor-pointer" href="/cart">
            CART / {String(count).padStart(2, "0")}
          </a>
          <button
            aria-expanded={mobileOpen}
            className="cursor-pointer"
            onClick={() => setMobileOpen((value) => !value)}
            type="button"
          >
            {mobileOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav aria-label="Mobile navigation" className="mobile-menu">
          <p>{"// NAVIGATION / SELECT_DESTINATION"}</p>
          <ol>
            {navigation.map(([number, label, href]) => (
              <li key={number}>
                {number === "10" ? (
                  <button
                    className="cursor-pointer"
                    onClick={openTerminal}
                    type="button"
                  >
                    <span>{number}</span>
                    <span>{label}</span>
                  </button>
                ) : (
                  <a className="cursor-pointer" href={href}>
                    <span>{number}</span>
                    <span>{label}</span>
                  </a>
                )}
              </li>
            ))}
          </ol>
          <p>STATUS / ROASTING=ONLINE</p>
        </nav>
      ) : null}
    </header>
  );
}
