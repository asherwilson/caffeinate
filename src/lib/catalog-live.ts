/**
 * Live catalog updates, so a page already open sees a new product appear.
 *
 * The implementation lives in Quick.js rather than here, because every site
 * connected to QuickDash needs the same thing and none of them should have to
 * write it. This file exists only to keep the import path stable for the store.
 *
 * ⚠️ Needs `pusher-js` installed alongside `@quickengine/quick`: the SDK loads
 * it on demand and has no runtime dependencies of its own.
 */
export { subscribeToCatalog } from "@quickengine/quick/browser";
