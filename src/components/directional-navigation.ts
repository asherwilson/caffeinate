"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Direction = "up" | "right" | "down" | "left";

const navigationItems = 10;
export const targetCount = 100;
const endTarget = 35;

const directionalTargets: Record<number, Partial<Record<Direction, number>>> = {
  10: { down: 16, left: 9 },
  11: { down: 12, right: 16, up: 0 },
  12: { down: 13, right: 17, up: 11 },
  13: { down: 14, right: 18, up: 12 },
  14: { down: 36, right: 15, up: 13 },
  15: { down: 36, left: 14, right: 19, up: 13 },
  16: { down: 17, left: 11, up: 10 },
  17: { down: 18, left: 12, up: 16 },
  18: { down: 19, left: 13, up: 17 },
  19: { down: 20, left: 15, up: 18 },
  20: { down: 36, left: 15, up: 19 },
  21: { down: 22, right: 25, up: 85 },
  22: { down: 23, right: 26, up: 21 },
  23: { down: 24, right: 27, up: 22 },
  24: { down: 86, right: 28, up: 23 },
  25: { down: 26, left: 21, up: 84 },
  26: { down: 27, left: 22, up: 25 },
  27: { down: 28, left: 23, up: 26 },
  28: { down: 29, left: 24, up: 27 },
  29: { down: 86, left: 24, up: 28 },
  30: { right: 31, up: 90 },
  31: { left: 30, right: 32, up: 90 },
  32: { left: 31, right: 33, up: 95 },
  33: { left: 32, right: 34, up: 95 },
  34: { left: 33, right: 35, up: 99 },
  35: { left: 34, up: 99 },
  36: { down: 37, up: 14 },
  37: { down: 39, right: 38, up: 36 },
  38: { down: 42, left: 37, up: 36 },
  39: { down: 40, right: 38, up: 37 },
  40: { down: 43, right: 41, up: 39 },
  41: { down: 42, left: 40, right: 38, up: 39 },
  42: { down: 44, left: 43, up: 38 },
  43: { down: 47, right: 42, up: 37 },
  44: { down: 45, left: 43, up: 42 },
  45: { down: 47, left: 43, right: 46, up: 44 },
  46: { down: 47, left: 45, up: 44 },
  47: { down: 49, right: 48, up: 43 },
  48: { down: 53, left: 47, up: 42 },
  49: { down: 50, right: 48, up: 47 },
  50: { down: 52, right: 51, up: 49 },
  51: { down: 52, left: 50, right: 48, up: 49 },
  52: { down: 54, right: 53, up: 50 },
  53: { down: 59, left: 52, up: 48 },
  54: { down: 55, right: 56, up: 52 },
  55: { down: 57, right: 56, up: 54 },
  56: { down: 58, left: 55, up: 53 },
  57: { down: 59, right: 58, up: 55 },
  58: { down: 59, left: 57, up: 56 },
  59: { down: 60, right: 66, up: 57 },
  60: { down: 61, right: 66, up: 59 },
  61: { down: 62, right: 67, up: 60 },
  62: { down: 70, right: 63, up: 61 },
  63: { down: 70, left: 62, right: 64, up: 61 },
  64: { down: 70, left: 63, right: 65, up: 61 },
  65: { down: 70, left: 64, right: 66, up: 61 },
  66: { down: 67, left: 65, up: 59 },
  67: { down: 68, left: 63, up: 66 },
  68: { down: 69, left: 64, up: 67 },
  69: { down: 70, left: 65, up: 68 },
  70: { down: 71, up: 62 },
  71: { down: 72, right: 84, up: 70 },
  72: { down: 73, right: 84, up: 71 },
  73: { down: 74, right: 84, up: 72 },
  74: { down: 78, right: 75, up: 73 },
  75: { down: 79, left: 74, right: 76, up: 73 },
  76: { down: 80, left: 75, right: 77, up: 73 },
  77: { down: 80, left: 76, right: 84, up: 73 },
  78: { down: 81, right: 79, up: 74 },
  79: { down: 82, left: 78, right: 80, up: 75 },
  80: { down: 83, left: 79, right: 84, up: 77 },
  81: { down: 85, right: 82, up: 78 },
  82: { down: 85, left: 81, right: 83, up: 79 },
  83: { down: 85, left: 82, right: 84, up: 80 },
  84: { down: 85, left: 77, up: 71 },
  85: { down: 21, right: 84, up: 81 },
  86: { down: 87, up: 24 },
  87: { down: 88, right: 91, up: 86 },
  88: { down: 89, right: 92, up: 87 },
  89: { down: 90, right: 93, up: 88 },
  90: { down: 30, right: 94, up: 89 },
  91: { down: 92, left: 87, right: 96, up: 86 },
  92: { down: 93, left: 88, right: 97, up: 91 },
  93: { down: 94, left: 89, right: 98, up: 92 },
  94: { down: 95, left: 90, right: 99, up: 93 },
  95: { down: 32, left: 90, right: 99, up: 94 },
  96: { down: 97, left: 91, up: 86 },
  97: { down: 98, left: 92, up: 96 },
  98: { down: 99, left: 93, up: 97 },
  99: { down: 35, left: 94, up: 98 },
};

function targetInDirection(index: number, direction: Direction) {
  if (index < navigationItems) {
    if (direction === "left") return index > 0 ? index - 1 : null;
    if (direction === "right") return index < 9 ? index + 1 : 10;
    if (direction === "down") return 11;
    return null;
  }

  return directionalTargets[index]?.[direction] ?? null;
}

export function useDirectionalNavigation() {
  const [selected, setSelected] = useState(0);
  const [wall, setWall] = useState<{
    direction: Direction;
    index: number;
  } | null>(null);
  const targets = useRef<Array<HTMLElement | null>>([]);
  const wallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const register = useCallback((index: number, element: HTMLElement | null) => {
    targets.current[index] = element;
  }, []);

  const select = useCallback((index: number) => {
    if (index < 0 || index >= targetCount) return;
    setSelected(index);
    targets.current[index]?.focus();
  }, []);

  const bumpWall = useCallback((index: number, direction: Direction) => {
    if (wallTimer.current) clearTimeout(wallTimer.current);
    setWall(null);
    window.requestAnimationFrame(() => {
      setWall({ direction, index });
      wallTimer.current = setTimeout(() => setWall(null), 180);
    });
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      const next = targetInDirection(selected, direction);
      if (next !== null) select(next);
      else bumpWall(selected, direction);
    },
    [bumpWall, select, selected],
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
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

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
        select(endTarget);
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

  const targetProps = (index: number) => ({
    "data-keyboard-target": true,
    "data-selected": selected === index ? "true" : undefined,
    "data-wall": wall?.index === index ? wall.direction : undefined,
    ref: (element: HTMLElement | null) => register(index, element),
    onPointerDown: () => select(index),
    tabIndex: -1,
  });

  return { register, select, selected, targetProps, wall };
}

export type DirectionalNavigation = ReturnType<typeof useDirectionalNavigation>;
