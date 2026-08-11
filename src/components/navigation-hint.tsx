"use client";

import { useCallback, useEffect, useState } from "react";
import { migrateBrowserValue } from "@/lib/browser-storage";

const storageKey = "caffeinate-navigation-hint-seen";
const legacyStorageKey = "caffeinated-navigation-hint-seen";

export function NavigationHint() {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(storageKey, "true");
    setVisible(false);
  }, []);

  useEffect(() => {
    if (migrateBrowserValue(storageKey, legacyStorageKey) !== "true") {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", dismissOnEscape);
    return () => window.removeEventListener("keydown", dismissOnEscape);
  }, [dismiss, visible]);

  if (!visible) return null;

  return (
    <aside className="navigation-hint" aria-label="Navigation shortcuts">
      <div>
        <p>{"// INPUT_METHODS / AVAILABLE"}</p>
        <p>ARROWS TO MOVE / ENTER TO OPEN / 01–10 TO JUMP / ⌘K FOR COMMANDS</p>
      </div>
      <button className="cursor-pointer" onClick={dismiss} type="button">
        ACKNOWLEDGE
      </button>
    </aside>
  );
}
