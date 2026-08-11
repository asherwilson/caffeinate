"use client";

import { useEffect, useState } from "react";
import { useCart } from "./cart-store";
import type { DirectionalNavigation } from "./directional-navigation";

const navigation = [
  ["01", "HOME", "/"],
  ["02", "COFFEE", "/coffee"],
  ["03", "ABOUT", "/about"],
  ["04", "FAQ", "/faq"],
  ["05", "CONTACT", "/contact"],
  ["06", "CART", "/cart"],
  ["07", "SEARCH", "/search"],
  ["08", "ACCOUNT", "/account"],
  ["09", "ORDERS", "/account/orders"],
  ["10", "COMMANDS", "#commands"],
] as const;

type HeaderProps = Partial<
  Pick<DirectionalNavigation, "register" | "selected" | "wall">
> & {
  onOpenTerminal: () => void;
  onSelect?: (index: number) => void;
};

export function Header({
  onOpenTerminal,
  onSelect,
  register,
  selected,
  wall,
}: HeaderProps) {
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
      <nav aria-label="Primary navigation" className="desktop-navigation">
        <ol className="navigation-list">
          {navigation.map(([number, label, href], index) => (
            <li key={number}>
              {number === "10" ? (
                <button
                  ref={(element) => register?.(index, element)}
                  className="cursor-pointer"
                  data-keyboard-target={register ? true : undefined}
                  data-selected={selected === index ? "true" : undefined}
                  data-wall={wall?.index === index ? wall.direction : undefined}
                  onClick={openTerminal}
                  onPointerDown={() => onSelect?.(index)}
                  type="button"
                >
                  {number} {label}
                </button>
              ) : (
                <a
                  ref={(element) => register?.(index, element)}
                  className="cursor-pointer"
                  href={href}
                  data-keyboard-target={register ? true : undefined}
                  data-selected={selected === index ? "true" : undefined}
                  data-wall={wall?.index === index ? wall.direction : undefined}
                  onPointerDown={() => onSelect?.(index)}
                >
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
      <a
        ref={(element) => register?.(navigation.length, element)}
        className="header-cta cursor-pointer"
        href="/account"
        data-keyboard-target={register ? true : undefined}
        data-selected={selected === navigation.length ? "true" : undefined}
        data-wall={
          wall?.index === navigation.length ? wall.direction : undefined
        }
        onPointerDown={() => onSelect?.(navigation.length)}
      >
        GET CAFFEINATED
      </a>

      <div className="mobile-header">
        <a className="mobile-brand cursor-pointer" href="/">
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
