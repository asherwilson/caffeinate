"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SLOTS, type SlotKey } from "@/lib/content-slots";

/**
 * The owner's words, available to any component on the page.
 *
 * ── Why a provider and not a prop ───────────────────────────────────────────
 *
 * 🔴 The hero sits four components below the page, the footer five. Threading
 * content down as a prop means every component between them takes a parameter
 * it does not use, and adding one editable line to a nested component becomes a
 * change to its whole ancestry — which is how a CMS stops being used.
 *
 * 🔑 Fetched ONCE on the server in the root layout and handed to this provider,
 * so the value is already in the HTML. This context never fetches; it only
 * distributes. That is what keeps a single request per page no matter how many
 * components read from it.
 */
type ContentMap = Partial<Record<SlotKey, string | string[]>>;

const ContentContext = createContext<ContentMap>({});

/**
 * Origins allowed to drive this page's copy while it is being previewed.
 *
 * 🔴 An allowlist, never `event.origin` as given. A `message` handler that does
 * not check where the message came from will accept one from ANY page that has
 * framed this site, which hands a stranger control of what the page says. It is
 * only ever shown to whoever framed it, so the damage is small — but "small" is
 * not a reason to write the insecure version of two lines.
 */
const CONSOLE_ORIGINS = [
  process.env.NEXT_PUBLIC_QUICKDASH_CONSOLE_URL,
  "https://quickdash.xyz",
  // Development only, and never on a deployed site: a page in production must
  // not take instructions from something running on the visitor's own machine.
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:3011", "http://127.0.0.1:3011"]
    : []),
]
  .filter((entry): entry is string => Boolean(entry))
  .map((entry) => {
    try {
      return new URL(entry).origin;
    } catch {
      return "";
    }
  })
  .filter(Boolean);

export function ContentProvider({
  content,
  children,
}: {
  content: ContentMap;
  children: React.ReactNode;
}) {
  /**
   * Words being typed in QuickDash right now, before they are saved.
   *
   * 🔑 Layered OVER the saved content rather than replacing it, so only the slot
   * being edited changes and the rest of the page stays exactly as it is.
   *
   * ⚠️ Never persisted and never sent anywhere. Reloading the preview drops it,
   * which is correct — an unsaved draft is not what the site says.
   */
  const [drafts, setDrafts] = useState<ContentMap>({});

  /**
   * What QuickDash says is currently PUBLISHED.
   *
   * 🔴 This exists because reloading the frame is not enough. This site caches
   * its own content fetch, so a preview that reloads still re-renders from that
   * cache — and the words stay stale for up to a minute after somebody hits
   * publish, which reads as the preview being broken.
   *
   * ⚠️ REPLACED wholesale, never merged. Merging would leave a slot that was
   * just cleared still showing its old value, because "cleared" arrives as an
   * absence rather than as a message.
   */
  const [published, setPublished] = useState<ContentMap | null>(null);

  useEffect(() => {
    // Not in a frame: nobody is previewing this, so there is nothing to listen
    // for. A normal visitor never attaches this handler at all.
    if (typeof window === "undefined" || window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (!CONSOLE_ORIGINS.includes(event.origin)) return;
      const data = event.data as {
        source?: string;
        type?: string;
        key?: string;
        value?: string;
      };
      if (data?.source !== "quickdash") return;

      if (data.type === "content-map") {
        const incoming = (event.data as { content?: Record<string, unknown> })
          .content;
        if (!incoming || typeof incoming !== "object") return;
        const next: ContentMap = {};
        for (const [key, value] of Object.entries(incoming)) {
          if (typeof value === "string" && value !== "") {
            next[key as keyof ContentMap] = value;
          } else if (Array.isArray(value)) {
            const urls = value.filter(
              (item): item is string => typeof item === "string" && item !== "",
            );
            if (urls.length > 0) next[key as keyof ContentMap] = urls;
          }
        }
        setPublished(next);
        // Anything being typed is finished with once a save lands.
        setDrafts({});
        return;
      }

      if (data.type !== "content-draft") return;
      if (typeof data.key !== "string") return;

      setDrafts((was) => ({
        ...was,
        // An emptied box shows the site's own fallback, exactly as clearing the
        // slot for real would — so the preview tells the truth about "Reset".
        [data.key as keyof ContentMap]:
          typeof data.value === "string" && data.value !== ""
            ? data.value
            : undefined,
      }));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The map is a fresh object on every server render; memoising on its identity
  // would defeat itself. Keyed on the values so consumers re-render only when
  // the copy actually changed.
  /**
   * 🔑 Three layers, in order of how current they are: what the server rendered,
   * what QuickDash says is published, and what is being typed right now.
   */
  const value = useMemo(
    () => ({ ...content, ...(published ?? {}), ...drafts }),
    [content, published, drafts],
  );
  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

/**
 * Read one slot.
 *
 * 🔑 ALWAYS returns a string. The fallback is this site's own shipped copy from
 * `SLOTS`, so a missing slot, an unpublished one, an empty one or an unreachable
 * QuickDash all render the same thing the site rendered before any of this
 * existed. A caller never has to handle "no content".
 *
 * ⚠️ `SlotKey` is a literal union, so a typo is a compile error rather than a
 * silently blank line nobody notices until it is live.
 */
export function useContent(): (key: SlotKey) => string {
  const content = useContext(ContentContext);
  return (key) => {
    const value = content[key];
    // An array here means a gallery slot was read as text — the fallback is
    // safer than rendering `["http://…"]` into the page.
    return typeof value === "string" ? value : SLOTS[key].value;
  };
}

/**
 * Read a picture, or nothing.
 *
 * ⚠️ Deliberately NOT `useContent`. An image has no sensible fallback — the
 * shipped value is an empty string, and rendering `<img src="">` requests the
 * page itself and logs an error. `null` lets a caller skip the element
 * entirely, which is the only correct behaviour for a picture nobody has chosen
 * yet.
 */
export function useContentImage(): (key: SlotKey) => string | null {
  const content = useContext(ContentContext);
  return (key) => {
    const value = content[key];
    if (typeof value !== "string" || value.trim() === "") return null;
    return value;
  };
}

/**
 * Every picture in a gallery slot, in the order the owner arranged them.
 *
 * 🔑 Separate from `useContentImage` because a gallery is an ARRAY. Reading one
 * through the single-image hook would hand a component `["http://…"]` stringified
 * into an `<img src>`, which fails silently — a broken picture and no error.
 */
export function useContentGallery(): (key: SlotKey) => string[] {
  const content = useContext(ContentContext);
  return (key) => {
    const value = content[key];
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  };
}
