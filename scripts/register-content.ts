/**
 * Declare this site's editable slots to QuickDash.
 *
 * ── When to run this ─────────────────────────────────────────────────────────
 *
 * After adding or changing anything in `src/lib/content-slots.ts`. It is safe to
 * run any number of times: labels and groups are updated, and a value is only
 * ever written into a slot that is EMPTY. Nothing the shop owner has typed can
 * be overwritten by running this.
 *
 *   QUICKDASH_API_KEY=qd_... pnpm content:register
 *
 * 🔴 Needs a SERVER key with `catalog:write`, not the publishable site key in
 * `NEXT_PUBLIC_QUICKDASH_SITE_KEY`. Declaring the shape of a site is an operator
 * action; a key that ships to browsers must never be able to do it.
 *
 * ⚠️ Not part of `build`. A build runs on every deploy, including rollbacks and
 * preview branches, and each one would re-register slots against PRODUCTION —
 * including a preview of a branch that renamed a key. Registration is a
 * deliberate act.
 */
import { manifestEntries } from "../src/lib/content-slots";

async function main() {
	const baseUrl = process.env.NEXT_PUBLIC_QUICKDASH_API_URL;
	const workspaceId = process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID;
	const apiKey = process.env.QUICKDASH_API_KEY;

	if (!baseUrl || !workspaceId) {
		throw new Error(
			"NEXT_PUBLIC_QUICKDASH_API_URL and NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID must be set.",
		);
	}
	if (!apiKey) {
		throw new Error(
			"QUICKDASH_API_KEY must be set — a server key with catalog:write.",
		);
	}

	const entries = manifestEntries();
	const response = await fetch(`${baseUrl}/v1/content/manage/manifest`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"QuickEngine-Workspace": workspaceId,
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({ slots: entries }),
	});

	if (!response.ok) {
		// The body carries QuickDash's own message, which names the offending key
		// for a validation failure. Swallowing it would leave "400" and a guess.
		throw new Error(
			`Registration failed (${response.status}): ${await response.text()}`,
		);
	}

	console.log(`Registered ${entries.length} slots.`);
	for (const entry of entries) {
		console.log(`  ${entry.group.padEnd(22)} ${entry.label}`);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
