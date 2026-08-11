"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction } from "./directional-navigation";

const targetSelector = [
  "main h1",
  "main h2",
  "main p",
  "main a",
  "main button",
  "main summary",
  "main input",
  "main select",
  "main textarea",
  "footer h2",
  "footer p",
  "footer a",
  "header a",
  "header button",
].join(",");

function isFormControl(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function useSpatialNavigation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targets = useRef<HTMLElement[]>([]);
  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
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
    if (focus) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
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

          return {
            index,
            lane: sameLane ? 0 : 1,
            score: primary + secondary * (sameLane ? 1.5 : 2.5),
          };
        })
        .filter(
          (
            candidate,
          ): candidate is { index: number; lane: number; score: number } =>
            candidate !== null,
        )
        .sort((a, b) => a.lane - b.lane || a.score - b.score);

      if (candidates[0]) select(candidates[0].index);
      else bumpWall(currentIndex, direction);
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
      ).filter((target) => !target.closest("[aria-hidden='true']"));
      const preservedIndex = selectedElement
        ? nextTargets.indexOf(selectedElement)
        : -1;
      const nextSelected =
        preservedIndex >= 0
          ? preservedIndex
          : Math.min(selectedRef.current, Math.max(0, nextTargets.length - 1));
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
        select(event.key === "0" ? 9 : Number(event.key) - 1);
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
        activate(selected);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (wallTimer.current) clearTimeout(wallTimer.current);
    };
  }, [activate, move, select, selected]);

  return rootRef;
}
