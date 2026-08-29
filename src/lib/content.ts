import "server-only";
import { SLOTS, type SlotKey } from "./content-slots";

/**
 * This site's editable words and pictures, fetched once per render.
 *
 * ── Why the server, and why never the browser ────────────────────────────────
 *
 * 🔴 Content is what a page SAYS. Fetching it in the browser means the first
 * paint shows the fallback copy and then swaps it for the real copy a moment
 * later — visible to every visitor, and worse, the version a crawler indexes is
 * the one the owner did not write.
 *
 * Read here, on the server, it arrives inside the HTML. There is no swap, no
 * layout shift, and no second round trip.
 *
 * ⚠️ The site key is public and already in the browser bundle, so this is not
 * hidden for secrecy. It is on the server because of WHEN it runs, not what it
 * holds.
 */
export type Content = Partial<Record<SlotKey, string | string[]>>;

/**
 * 🔑 Cached for a minute rather than per-request or forever.
 *
 * Forever means an owner edits a headline and cannot understand why the site
 * has not changed. Per-request means every visitor costs a QuickDash call, which
 * is metered.
 *
 * ⚠️ Was a minute, which was too long to work against: after publishing, the
 * real site kept showing the old words while somebody stared at it. Ten seconds
 * still collapses a burst of traffic into one fetch and is short enough that
 * "publish, then look" behaves the way anybody would expect.
 *
 * 🔑 The PREVIEW does not wait for this at all — QuickDash pushes the published
 * slots straight into the framed page, so it updates the moment a save lands.
 * This window only governs ordinary visitors.
 */
const REVALIDATE_SECONDS = 10;

export async function loadContent(): Promise<Content> {
  const baseUrl = process.env.NEXT_PUBLIC_QUICKDASH_API_URL;
  const workspaceId = process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID;
  const siteKey = process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY;
  if (!baseUrl || !workspaceId || !siteKey) return {};

  try {
    const response = await fetch(`${baseUrl}/v1/content`, {
      headers: {
        "QuickEngine-Workspace": workspaceId,
        "QuickEngine-Publishable-Key": siteKey,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return {};
    const body = (await response.json()) as {
      data?: { content?: Record<string, unknown> };
    };
    const content = body.data?.content ?? {};

    /**
     * ⚠️ Empty strings are dropped, not kept.
     *
     * A slot that exists but holds nothing must fall back to the shipped copy.
     * Keeping `""` would render a blank headline — which looks exactly like a
     * broken site, and is the single most likely way a CMS takes a page down.
     */
    const result: Content = {};
    for (const key of Object.keys(SLOTS) as SlotKey[]) {
      const value = content[key];
      /**
       * ⚠️ A GALLERY arrives as an array, and an earlier version of this loop
       * kept only strings — so every picture in a gallery was silently dropped
       * between the API and the page. An empty array is dropped like an empty
       * string, so the slot falls back rather than rendering nothing.
       */
      if (Array.isArray(value)) {
        const urls = value.filter(
          (item): item is string =>
            typeof item === "string" && item.trim() !== "",
        );
        if (urls.length > 0) result[key] = urls;
        continue;
      }
      if (typeof value === "string" && value.trim() !== "") result[key] = value;
    }
    return result;
  } catch {
    /**
     * 🔴 An unreachable QuickDash must never take this shop down.
     *
     * Every slot has the site's own copy as its fallback, so an empty map
     * renders exactly what the site rendered before any of this existed. A
     * content system that can black out a storefront is worse than no content
     * system.
     */
    return {};
  }
}
