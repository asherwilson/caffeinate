"use client";

import { useCallback, useEffect } from "react";

export type LightboxItem = { type: "image" | "video"; url: string };

/**
 * A closer look at a product's media.
 *
 * ⚠️ Styled to this shop rather than to QuickDash. The console's version uses
 * its own glass; this one uses the shop's paper colour at the same opacity the
 * hero backdrop uses, so the page behind stays legible and the whole thing
 * still looks like Caffeinate rather than like an admin tool that wandered in.
 */
export function MediaLightbox({
  index,
  items,
  onClose,
  onIndexChange,
}: {
  /** Null closes it. */
  index: number | null;
  items: readonly LightboxItem[];
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const count = items.length;
  const open = index !== null;

  const step = useCallback(
    (by: number) => {
      if (index === null || count === 0) return;
      onIndexChange((index + by + count) % count);
    },
    [count, index, onIndexChange],
  );

  /**
   * Escape closes, arrows move. A viewer that traps somebody until they find a
   * small × is the most irritating thing on a shop.
   */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open, step]);

  // The page behind must not scroll while this is over it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Marks the page so the decorative dither can step aside. Screening the
    // shop is right when a photograph sits in it; it is wrong when the point is
    // to look at that photograph without anything laid over the view.
    document.body.classList.add("lightbox-open");
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove("lightbox-open");
    };
  }, [open]);

  if (index === null) return null;
  const current = items[index];
  if (!current) return null;

  return (
    <div aria-modal="true" className="lightbox" role="dialog">
      {/*
       * 🔴 A div, NOT a button, and that is the fix rather than a preference.
       * The shop dithers its buttons with a conic-gradient checkerboard on
       * hover, so a full-screen <button> put a 2px grid across the entire muted
       * background the moment the pointer moved onto it. Overriding the
       * background lost the cascade to the :hover rule; not being a button
       * removes the whole class of problem.
       *
       * ⚠️ Keyboard users are already served: Escape closes, and there is a real
       * CLOSE button. This is a convenience target for a pointer, so it is
       * hidden from assistive technology rather than pretending to be a control.
       */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape and CLOSE cover it */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer convenience only */}
      <div aria-hidden="true" className="lightbox-scrim" onClick={onClose} />

      <div className="lightbox-stage">
        {current.type === "video" ? (
          // biome-ignore lint/a11y/useMediaCaption: shop-supplied clip
          <video
            autoPlay
            className="lightbox-media"
            controls
            key={current.url}
            loop
            playsInline
            src={current.url}
          />
        ) : (
          // biome-ignore lint/performance/noImgElement: an arbitrary storage url
          // at natural size. next/image wants a configured host and a known
          // width, and this deliberately shows the picture exactly as uploaded.
          <img alt="" className="lightbox-media" src={current.url} />
        )}

        {count > 1 ? (
          <>
            <button
              aria-label="Previous"
              className="lightbox-step lightbox-step-prev"
              onClick={() => step(-1)}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              className="lightbox-step lightbox-step-next"
              onClick={() => step(1)}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <button
        aria-label="Close"
        className="lightbox-close"
        onClick={onClose}
        type="button"
      >
        CLOSE
      </button>
    </div>
  );
}
