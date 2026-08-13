"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { migrateBrowserValue } from "@/lib/browser-storage";
import { useToast } from "./toast-store";

const routes: Record<string, string> = {
  about: "/about",
  account: "/account",
  cart: "/cart",
  coffee: "/coffee",
  contact: "/contact",
  faq: "/faq",
  home: "/",
  loading: "/loading-preview",
  orders: "/account/orders",
  search: "/search",
  // `/shop` was a duplicate of `/coffee` — same grid, different heading. Kept
  // as a command alias because it is the word people type.
  shop: "/coffee",
};

const themes = [
  "espresso",
  "espresso-inverted",
  "coffee-cherry",
  "terminal-cream",
  "espresso-steam",
  "paper-filter",
  "cortado",
  "midnight-roast",
  "washed-process",
  "natural-process",
  "cafecito",
  "paper",
  "roast",
  "latte",
  "carbon",
  "kraft",
  "ash",
  "toast",
  "linen",
  "dust",
  "receipt",
  "night-shift",
] as const;

type ThemeName = (typeof themes)[number];

type TerminalProps = {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
};

export function Terminal({ onClose, onOpen, open }: TerminalProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [command, setCommand] = useState("");
  const [commands, setCommands] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [output, setOutput] = useState<string[]>([
    "CAFFEINATE TERMINAL / READY",
    "TYPE help TO LIST COMMANDS",
  ]);
  const [theme, setTheme] = useState<ThemeName>("espresso");

  useEffect(() => {
    const savedTheme = migrateBrowserValue(
      "caffeinate-theme",
      "caffeinated-theme",
    );
    if (themes.includes(savedTheme as ThemeName)) {
      const nextTheme = savedTheme as ThemeName;
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    } else {
      document.documentElement.dataset.theme = "espresso";
    }
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (
        (event.metaKey && event.key.toLowerCase() === "k") ||
        (!isTyping && event.key === "`")
      ) {
        event.preventDefault();
        onOpen();
      } else if (open && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [onClose, onOpen, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const navigate = (path: string) => {
    setOutput((lines) => [...lines, `OPEN ${path}`]);
    router.push(path);
    onClose();
  };

  const execute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = command.trim();
    if (!value) return;

    setCommands((items) => [...items, value]);
    setHistoryIndex(commands.length + 1);
    setCommand("");

    const [name, ...arguments_] = value.split(/\s+/);
    const normalized = name.toLowerCase();

    if (normalized === "clear") {
      setOutput([]);
      return;
    }

    setOutput((lines) => [...lines, `% ${value}`]);

    if (normalized === "help") {
      setOutput((lines) => [
        ...lines,
        "NAV / home shop coffee about faq contact cart search account orders",
        "SYSTEM / theme [name] / RUN theme TO LIST PALETTES",
        "SYSTEM / go /route clear close exit help",
        "SHORTCUTS / ` OR ⌘K TO OPEN / ESC TO CLOSE / ↑↓ HISTORY",
      ]);
      return;
    }

    if (normalized === "shortcuts" || normalized === "keys") {
      setOutput((lines) => [
        ...lines,
        "POINTER / HOVER TO PREVIEW / CLICK TO SELECT + OPEN",
        "ARROWS / MOVE SPATIALLY / EDGE INPUT PRODUCES WALL RESPONSE",
        "ENTER / OPEN SELECTED CONTROL",
        "NUMBERS / 1–9 + 0 JUMP TO HEADER DESTINATIONS 01–10",
        "HOME + END / FIRST + LAST TARGET",
        "TERMINAL / ` OR ⌘K / ESC TO CLOSE",
      ]);
      return;
    }

    if (normalized === "theme") {
      const requestedTheme = arguments_[0]?.toLowerCase();
      if (!requestedTheme) {
        setOutput((lines) => [
          ...lines,
          `ACTIVE / ${theme}`,
          `AVAILABLE / ${themes.join(" / ")}`,
        ]);
        return;
      }
      let resolvedTheme = requestedTheme;
      if (requestedTheme === "next" || requestedTheme === "previous") {
        const currentIndex = themes.indexOf(theme);
        const offset = requestedTheme === "next" ? 1 : -1;
        resolvedTheme =
          themes[(currentIndex + offset + themes.length) % themes.length];
      }
      if (!themes.includes(resolvedTheme as ThemeName)) {
        setOutput((lines) => [
          ...lines,
          `THEME_NOT_FOUND / ${requestedTheme}`,
          `AVAILABLE / ${themes.join(" / ")}`,
        ]);
        return;
      }
      const nextTheme = resolvedTheme as ThemeName;
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      window.localStorage.setItem("caffeinate-theme", nextTheme);
      pushToast({
        code: "THEME",
        message: `${nextTheme.toUpperCase()} PALETTE APPLIED.`,
        tone: "success",
      });
      setOutput((lines) => [...lines, `THEME_APPLIED / ${nextTheme}`]);
      return;
    }

    if (normalized === "close" || normalized === "exit") {
      onClose();
      return;
    }

    if (normalized === "go") {
      const path = arguments_[0];
      if (path?.startsWith("/")) navigate(path);
      else setOutput((lines) => [...lines, "ERROR / EXPECTED go /route"]);
      return;
    }

    const route = routes[normalized];
    if (route) navigate(route);
    else setOutput((lines) => [...lines, `COMMAND_NOT_FOUND / ${normalized}`]);
  };

  if (!open) return null;

  return (
    <div className="terminal-layer">
      <button
        aria-label="Close command terminal"
        className="terminal-backdrop cursor-pointer"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label="Command terminal"
        aria-modal="true"
        className="terminal"
        role="dialog"
      >
        <header className="terminal-header">
          <span>CAFFEINATE / COMMANDS</span>
          <button
            className="terminal-close cursor-pointer"
            onClick={onClose}
            type="button"
          >
            ESC
          </button>
        </header>

        <div aria-live="polite" className="terminal-output">
          {output.map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))}
        </div>

        <form className="terminal-input-line" onSubmit={execute}>
          <label htmlFor="terminal-command">%</label>
          <input
            autoComplete="off"
            className="cursor-text"
            id="terminal-command"
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" && commands.length > 0) {
                event.preventDefault();
                const next = Math.max(0, historyIndex - 1);
                setHistoryIndex(next);
                setCommand(commands[next] ?? "");
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                const next = Math.min(commands.length, historyIndex + 1);
                setHistoryIndex(next);
                setCommand(commands[next] ?? "");
              }
            }}
            ref={inputRef}
            spellCheck={false}
            value={command}
          />
        </form>
      </section>
    </div>
  );
}
