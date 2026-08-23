"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * 🔴 Emptied deliberately, 2026-08-22.
 *
 * These were stock photographs of coffee that was never for sale, shown as
 * though they were this business's own. Marketing imagery belongs in the
 * content module and will be chosen rather than inherited from a template.
 *
 * An empty list renders no backdrop, which is honest. A stock photo of
 * somebody else's roastery is not.
 */
const backdrops: string[] = [];

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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Motion is decoration. Somebody who has asked for less of it gets the
    // first image and no rotation, rather than a slideshow they cannot stop.
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (stillness.matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % backdrops.length),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, []);

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
