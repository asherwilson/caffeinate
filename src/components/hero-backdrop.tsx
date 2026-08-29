"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useContentGallery } from "./content-store";

/**
 * 🟢 Filled from the content module, 2026-08-23.
 *
 * These were stock photographs of coffee that was never for sale, shown as
 * though they were this business's own. They were removed on 2026-08-22 with
 * the note that marketing imagery "belongs in the content module and will be
 * chosen rather than inherited from a template". This is that.
 *
 * 🔑 Three numbered slots, and any that are empty are skipped — so the shop
 * owner uploads one picture and gets one, three and gets a rotation, or none
 * and gets the same honest empty hero it has had since.
 */
const INTERVAL = 6500;

/**
 * The hero's moving backdrop.
 *
 * 🔴 `next/image`, not a CSS background. The source files are three megabytes
 * each and there are four of them, so shipping them raw would put twelve
 * megabytes in front of first paint. Only the first is `priority`; the rest
 * load as the rotation reaches them.
 *
 * ⚠️ Purely decorative, so `aria-hidden` and no keyboard reachability. It
 * carries no information the page does not already say in text.
 */
export function HeroBackdrop() {
  const gallery = useContentGallery();
  const [index, setIndex] = useState(0);

  // As many pictures as the owner has chosen, in their order. None is a valid
  // answer and renders no backdrop at all.
  const backdrops = gallery("home.hero.backdrops");

  const count = backdrops.length;

  useEffect(() => {
    // 🔴 Nothing to rotate through. Without this guard `% 0` is NaN, every
    // `position === index` comparison fails, and a single chosen picture would
    // never become visible.
    if (count < 2) return;

    // Motion is decoration. Somebody who has asked for less of it gets the
    // first image and no rotation, rather than a slideshow they cannot stop.
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (stillness.matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [count]);

  // No picture chosen yet: render nothing at all rather than an empty frame.
  if (count === 0) return null;

  return (
    <div aria-hidden="true" className="hero-backdrop">
      {backdrops.map((src, position) => (
        <Image
          alt=""
          className="hero-backdrop-slide"
          data-active={position === index ? "true" : undefined}
          fill
          key={src}
          priority={position === 0}
          sizes="100vw"
          src={src}
        />
      ))}
      <div className="hero-backdrop-glass" />
    </div>
  );
}
