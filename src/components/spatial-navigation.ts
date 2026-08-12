"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction } from "./directional-navigation";
import { adjacentPage, pageIndexFor } from "./navigation-items";

/** Where the slide direction is handed to the next document. */
const slideKey = "caffeinate-slide";

/**
 * Record which way a journey runs, for the page about to load.
 *
 * Read before first paint by the inline script in the root layout. A full
 * navigation throws away everything else, so this is the only channel.
 */
function rememberSlide(direction: "left" | "right") {
  try {
    sessionStorage.setItem(slideKey, direction);
  } catch {
    // Private modes can refuse storage. The slide falls back to its default
    // direction, which is a cosmetic loss and not worth failing navigation for.
  }
}

/*
 * Everything a visitor should be able to land on.
 *
 * Deliberately includes prose, not only controls: a keyboard user reading the
 * FAQ needs to reach each answer, and a page whose text is unreachable can only
 * be crossed by jumping between its links.
 *
 * ⚠️ `span` is excluded on purpose. Spans are usually inline inside a paragraph
 * that is already a target, so including them would nest a target inside a
 * target and make one press appear to do nothing.
 */
/*
 * Everything a visitor should be able to land on.
 *
 * 🔴 NOT scoped to `main`, `footer` and `header`, which is what it used to be
 * and why most of the home page was unreachable. `<main className="hero">`
 * wraps only the hero, so the catalog, featured release, brew protocol and
 * background sections are siblings of it and matched nothing at all: pressing
 * down at the bottom of the hero skipped four whole sections and landed in the
 * footer, because there was genuinely nothing in between to land on.
 *
 * The scan already runs against the shell, so the scoping was redundant as well
 * as wrong. Bare tags inherit that root and cover every section automatically,
 * including ones nobody has written yet.
 *
 * ⚠️ `span` is deliberately absent. Spans are usually inline inside a paragraph
 * that is already a target, so including them would nest a target inside a
 * target and make one press appear to do nothing.
 */
const targetSelector = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "dt",
  "dd",
  "blockquote",
  "figcaption",
  "label",
  "img",
  "a",
  "button",
  "summary",
  "input",
  "select",
  "textarea",
].join(",");

/**
 * How close to the viewport edge the cursor may sit before the page follows.
 *
 * `block: "nearest"` alone scrolls the bare minimum, which parks whatever you
 * just moved to hard against the top or bottom edge — so it reads as though the
 * arrows are not scrolling at all, only revealing a sliver. Keeping a margin
 * means the page moves with you and you can see where you are going.
 */
const edgeMargin = () => Math.min(160, window.innerHeight * 0.22);

function isFormControl(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/**
 * A wrapper whose entire content is one control.
 *
 * 🔴 `<li><a>01 HOME</a></li>` puts two targets in exactly the same rectangle.
 * The `li` is earlier in the document, so it won the cursor, and `activate`
 * only presses `a, button, summary` — which is why Enter did nothing on every
 * item in the header while GET CAFFEINATED, a bare link outside the list,
 * worked fine.
 *
 * Deliberately narrow. Requiring the container's text to be exactly the
 * control's text keeps a paragraph that merely happens to contain an inline
 * link, which is still somewhere you want to be able to arrow to. It drops only
 * the wrappers that add nothing of their own.
 */
function wrapsOneControl(element: HTMLElement): boolean {
  if (element.matches("a, button, summary, input, select, textarea"))
    return false;
  const controls = element.querySelectorAll("a, button, summary");
  if (controls.length !== 1) return false;
  return controls[0].textContent?.trim() === element.textContent?.trim();
}

/**
 * Where the cursor starts on a freshly opened page.
 *
 * 🔴 The page's own title, not its link in the header. Parking the highlight in
 * the chrome meant the first Down press was always spent walking back into the
 * page, and the home page matched nothing at all so it started on whatever
 * happened to be first in the DOM.
 *
 * Landing on the heading also gives the arrival something to say: the slide
 * finishes, the title takes the highlight a beat later, and where the keys will
 * move from is obvious without anyone having to press one.
 *
 * Every page reaches this through `hero`, `interior-page` or `system-state`,
 * each of which renders exactly one `h1`, and the header renders none — so the
 * first heading in the document is the page title on every route.
 */
function indexOfCurrentPage(list: HTMLElement[]): number {
  const title = list.findIndex(
    (target) => target.tagName === "H1" && !target.closest("header, nav"),
  );
  if (title >= 0) return title;

  // No heading to land on. Fall back to this page's link in the header, which
  // at least keeps the highlight somewhere related to where you just arrived.
  // Longest match wins, so `/account/orders` picks ORDERS over ACCOUNT.
  const path = window.location.pathname;
  let best = -1;
  let bestLength = 0;
  list.forEach((target, index) => {
    const href = target.getAttribute("href");
    if (!href || !href.startsWith("/") || href === "/") return;
    if (
      (path === href || path.startsWith(`${href}/`)) &&
      href.length > bestLength
    ) {
      best = index;
      bestLength = href.length;
    }
  });
  return best;
}

export function useSpatialNavigation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targets = useRef<HTMLElement[]>([]);
  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  // The first scan places the cursor on the current page. Every scan after it
  // preserves wherever the visitor has since moved to.
  const placed = useRef(false);
  const [wall, setWall] = useState<{
    direction: Direction;
    index: number;
  } | null>(null);
  const wallRef = useRef<{
    direction: Direction;
    index: number;
  } | null>(null);
  const wallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const select = useCallback((index: number, focus = true) => {
    const target = targets.current[index];
    if (!target) return;
    selectedRef.current = index;
    setSelected(index);
    if (!focus) return;

    // `preventScroll`, then decide for ourselves. The browser's own focus
    // scrolling is the "nearest" behaviour we are deliberately not using.
    target.focus({ preventScroll: true });

    const rect = target.getBoundingClientRect();
    const margin = edgeMargin();
    const past = rect.bottom > window.innerHeight - margin;
    const above = rect.top < margin;

    // Comfortably inside the safe band: leave the page where it is, so moving
    // between neighbours on one screen does not shunt the whole layout around.
    // (see below for why the scroll behaviour is chosen by distance)
    if (!past && !above) return;

    /*
     * 🔴 Smooth only for short hops.
     *
     * Each `scrollIntoView` cancels the one before it, so holding an arrow key
     * restarts the animation faster than it can finish and the page ends up
     * going nowhere. That was survivable while every target was a screen apart
     * at most; once the catalog became reachable, a single press could need a
     * 1400px jump and the scroll simply never happened — the cursor left the
     * viewport and the page sat still.
     *
     * Anything beyond a screen and a bit jumps instantly, which always lands.
     * Neighbourly movement keeps the smooth follow, which is where it reads
     * well anyway.
     */
    const viewport = window.innerHeight;
    const distance = past ? rect.bottom - viewport : -rect.top;

    target.scrollIntoView({
      behavior: distance > viewport * 1.2 ? "instant" : "smooth",
      block: "center",
      inline: "nearest",
    });
  }, []);

  const bumpWall = useCallback((index: number, direction: Direction) => {
    if (wallTimer.current) clearTimeout(wallTimer.current);
    wallRef.current = null;
    setWall(null);
    window.requestAnimationFrame(() => {
      wallRef.current = { direction, index };
      setWall({ direction, index });
      wallTimer.current = setTimeout(() => {
        wallRef.current = null;
        setWall(null);
      }, 180);
    });
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      const currentIndex = selectedRef.current;
      const current = targets.current[currentIndex];
      if (!current) return;
      const currentRect = current.getBoundingClientRect();
      const currentX = currentRect.left + currentRect.width / 2;
      const currentY = currentRect.top + currentRect.height / 2;

      const candidates = targets.current
        .map((target, index) => {
          if (index === currentIndex) return null;
          const rect = target.getBoundingClientRect();

          // 🔴 Skip anything not currently rendered.
          //
          // The mobile header and menu are `display: none` on desktop, and the
          // desktop nav is hidden on mobile, but both stay in the DOM. Without
          // this, half the header was invisible targets you had to arrow
          // through, which read as the cursor stopping on nothing or needing
          // two presses to cross one gap.
          //
          // ⚠️ Judged HERE and not while scanning. During a view transition
          // nothing reports as visible, and the scan only re-runs on DOM
          // changes, so filtering there left the page with no targets at all
          // and no way to recover. Movement re-measures on every press.
          if (rect.width === 0 && rect.height === 0) return null;
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const dx = x - currentX;
          const dy = y - currentY;

          // Compare edges rather than centres. Elements in the same header row
          // often differ by a few pixels in height; centre-only navigation
          // mistakes that tiny offset for an element above or below and jumps
          // sideways when the user is actually pressing against the page wall.
          const edgeGap =
            direction === "up"
              ? currentRect.top - rect.bottom
              : direction === "down"
                ? rect.top - currentRect.bottom
                : direction === "left"
                  ? currentRect.left - rect.right
                  : rect.left - currentRect.right;
          const eligible =
            ((direction === "up" && dy < 0) ||
              (direction === "down" && dy > 0) ||
              (direction === "left" && dx < 0) ||
              (direction === "right" && dx > 0)) &&
            edgeGap >= -2;
          if (!eligible) return null;

          const primary =
            direction === "up" || direction === "down"
              ? Math.max(0, edgeGap)
              : Math.max(0, edgeGap);
          const secondary =
            direction === "up" || direction === "down"
              ? Math.abs(dx)
              : Math.abs(dy);

          const perpendicularOverlap =
            direction === "up" || direction === "down"
              ? Math.min(currentRect.right, rect.right) -
                Math.max(currentRect.left, rect.left)
              : Math.min(currentRect.bottom, rect.bottom) -
                Math.max(currentRect.top, rect.top);
          const sameLane = perpendicularOverlap >= -8;

          // A second-column destination is valid only when it sits inside a
          // clear directional cone. Anything farther off-axis is not a
          // neighbour; it is another part of the page and the correct response
          // is the same wall nudge used by the homepage.
          const inDirectionalCone = secondary <= Math.max(40, primary * 0.8);
          if (!sameLane && !inDirectionalCone) return null;

          /*
           * 🔴 The axis you are travelling on decides; the other one only
           * breaks ties.
           *
           * Perpendicular offset used to be weighted 1.5x, which meant a wide
           * element lost to whatever happened to share its centre line. From
           * the hero heading (28→653, centre 340) pressing down chose a button
           * 90px away over the paragraph 24px directly beneath it, purely
           * because the paragraph is narrow and left-aligned. Presses skipped
           * the obvious next thing and landed across the page, and from there
           * the only candidate left was often the footer.
           *
           * Distance along the direction of travel now dominates, and being
           * off-centre is a mild penalty rather than the deciding factor.
           */
          return {
            index,
            lane: sameLane ? 0 : 1,
            score: primary + secondary * (sameLane ? 0.2 : 1.2),
          };
        })
        .filter(
          (
            candidate,
          ): candidate is { index: number; lane: number; score: number } =>
            candidate !== null,
        )
        .sort((a, b) => a.lane - b.lane || a.score - b.score);

      if (candidates[0]) {
        select(candidates[0].index);
        return;
      }

      // 🔴 Running out of page sideways is a journey, not a dead end.
      //
      // Arrowing right past the last thing on HOME slides into COFFEE, and left
      // comes back. The wall nudge is kept for the two genuine ends of the
      // strip, where there is nowhere further to go.
      if (direction === "left" || direction === "right") {
        const next = adjacentPage(window.location.pathname, direction);
        if (next) {
          rememberSlide(direction);
          window.location.assign(next);
          return;
        }
      }

      bumpWall(currentIndex, direction);
    },
    [bumpWall, select],
  );

  const activate = useCallback((index: number) => {
    const target = targets.current[index];
    if (
      !target?.matches("a, button, summary") ||
      target.dataset.pressed === "true"
    )
      return;
    target.dataset.pressed = "true";
    window.setTimeout(() => {
      target.click();
      window.setTimeout(() => delete target.dataset.pressed, 70);
    }, 90);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let listeners = new AbortController();
    let frame = 0;

    const scan = () => {
      listeners.abort();
      listeners = new AbortController();
      const selectedElement = targets.current[selectedRef.current];
      const nextTargets = Array.from(
        root.querySelectorAll<HTMLElement>(targetSelector),
      ).filter(
        (target) =>
          !target.closest("[aria-hidden='true']") &&
          // Opt-out for anything that is visible but is not a destination.
          !target.hasAttribute("data-nav-skip") &&
          !wrapsOneControl(target),
      );
      const preservedIndex = selectedElement
        ? nextTargets.indexOf(selectedElement)
        : -1;
      // 🔴 Only counts as placed once the title was actually found. Marking it
      // on the first scan that returns any targets at all loses the race
      // against hydration: an early pass over a partial tree sets the flag, the
      // rest of the page arrives afterwards, and the cursor is never placed.
      //
      // Placing against a partial list is still safe. Later scans re-find the
      // selection by element identity, not by index, so the highlight stays on
      // the same heading however much the list grows underneath it.
      const currentPageIndex = placed.current
        ? -1
        : indexOfCurrentPage(nextTargets);
      if (currentPageIndex >= 0) placed.current = true;
      const nextSelected =
        preservedIndex >= 0
          ? preservedIndex
          : currentPageIndex >= 0
            ? currentPageIndex
            : Math.min(
                selectedRef.current,
                Math.max(0, nextTargets.length - 1),
              );
      targets.current = nextTargets;
      if (nextSelected !== selectedRef.current) {
        selectedRef.current = nextSelected;
        setSelected(nextSelected);
      }
      targets.current.forEach((target, index) => {
        target.dataset.keyboardTarget = "true";
        if (index === selectedRef.current) target.dataset.selected = "true";
        else delete target.dataset.selected;
        if (wallRef.current?.index === index) {
          target.dataset.wall = wallRef.current.direction;
        } else {
          delete target.dataset.wall;
        }
        if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
        target.addEventListener("pointerdown", () => select(index, false), {
          signal: listeners.signal,
        });
      });
    };

    // Interior pages may contain a selectively hydrated Suspense subtree. An
    // immediate scan from this parent effect can add tabindex/data attributes
    // before React hydrates that child, producing a mismatch even though the
    // rendered content is identical. Wait until the browser has crossed a paint
    // boundary, then enhance the settled DOM and begin watching real updates.
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(scan);
    });
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        scan();
        observer.observe(root, { childList: true, subtree: true });
      });
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      listeners.abort();
    };
  }, [select]);

  useEffect(() => {
    selectedRef.current = selected;
    wallRef.current = wall;
    targets.current.forEach((target, index) => {
      if (index === selected) target.dataset.selected = "true";
      else delete target.dataset.selected;
      if (wall?.index === index) target.dataset.wall = wall.direction;
      else delete target.dataset.wall;
    });
  }, [selected, wall]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isFormControl(event.target)
      )
        return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        /*
         * 🔴 The nth item in the header, not the nth target on the page.
         *
         * This used to be a raw index into the target list, which worked only
         * because the old hand-authored map guaranteed slots 0-9 were the
         * navigation. Against a list derived from the layout it means "the
         * tenth element in the document", so the numbers printed in the header
         * stopped agreeing with the keys that are supposed to reach them.
         */
        const wanted = event.key === "0" ? 9 : Number(event.key) - 1;
        const navItem = rootRef.current?.querySelectorAll<HTMLElement>(
          ".navigation-list a, .navigation-list button",
        )[wanted];
        const index = navItem ? targets.current.indexOf(navItem) : -1;
        if (index >= 0) {
          // 🔴 Select *and* follow. A number printed next to a destination is a
          // shortcut to the destination, not a way to move a highlight onto it.
          // Selecting alone also stopped being usable the moment the cursor
          // started on the page title: Enter on arrival has nothing to press,
          // so the numbers were the one way in and they went nowhere.
          //
          // `activate` waits 90ms behind its own press animation, so the order
          // still reads correctly — the item highlights, blinks, then leaves.
          select(index);
          activate(index);
        }
        return;
      }

      const directions: Partial<Record<string, Direction>> = {
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
      };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
      } else if (event.key === "Home") {
        event.preventDefault();
        select(0);
      } else if (event.key === "End") {
        event.preventDefault();
        select(targets.current.length - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        // 🔴 The ref, not the `selected` state. Arrow movement writes the ref
        // synchronously and the state a render later, so pressing Enter right
        // after an arrow read the previous target — usually activating nothing,
        // because the stale index no longer pointed at a link.
        activate(selectedRef.current);
      }
    };

    /*
     * A clicked link travels in the same direction the arrows would.
     *
     * 🔴 Without this every mouse navigation played the forward animation, so
     * clicking ORDERS and then HOME slid the same way both times, which reads as
     * the site having no sense of where its pages are. Direction comes from the
     * strip order, so the mouse and the arrow keys agree.
     */
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href?.startsWith("/") || link?.target === "_blank") return;

      const from = pageIndexFor(window.location.pathname);
      const to = pageIndexFor(new URL(href, window.location.origin).pathname);
      // Either end unplaced, or a link to the page already open: leave the
      // default. Guessing a direction for a journey we cannot order would be
      // worse than the fallback.
      if (from < 0 || to < 0 || from === to) return;
      rememberSlide(to > from ? "right" : "left");
    };

    window.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleKeyDown);
      if (wallTimer.current) clearTimeout(wallTimer.current);
    };
    // `selected` is deliberately absent: the handler reads `selectedRef`, so it
    // no longer needs re-binding on every cursor move.
  }, [activate, move, select]);

  return rootRef;
}
