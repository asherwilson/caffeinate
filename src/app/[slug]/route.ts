import { type NextRequest, NextResponse } from "next/server";

/**
 * Partner links — `caffeinate.sh/sarahbrews`.
 *
 * ── Why a route handler and not a page ──────────────────────────────────────
 *
 * This has no UI. It resolves the code, remembers it, and sends the visitor to
 * the shop — and a route handler is the only thing in the App Router that can
 * set a cookie and redirect in one response. A page would need a client
 * component and a flash of empty screen to do the same job worse.
 *
 * 🔑 Next resolves static segments before dynamic ones, so `/about`, `/cart`
 * and `/checkout` still win. This only catches paths nothing else claims.
 *
 * ⚠️ Every new partner is a row in QuickDash, not a deploy here. That is the
 * whole point of resolving the code at request time: the marketing side can
 * add and retire links all day without touching this repository.
 */

/** Long enough to survive somebody browsing before they buy. */
const REMEMBER_FOR_DAYS = 30;

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const home = new URL("/", request.url);

	/**
	 * 🔴 Say WHY, in development only.
	 *
	 * Every failure below redirects silently to the shop, which is right for a
	 * visitor and useless for whoever is setting a link up: a misconfigured
	 * workspace, a revoked key and a code that does not exist all look identical
	 * from the outside — a bounce to the home page with no error anywhere.
	 *
	 * The reason goes to the SERVER log, never to the response, so nothing about
	 * the workspace's configuration is exposed to anybody following a link.
	 */
	const giveUp = (reason: string) => {
		if (process.env.NODE_ENV !== "production") {
			console.warn(`[partner-link] "${slug}" ignored: ${reason}`);
		}
		return NextResponse.redirect(home);
	};

	const baseUrl = process.env.NEXT_PUBLIC_QUICKDASH_API_URL;
	const siteKey = process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY;
	const workspaceId = process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID;
	if (!baseUrl || !siteKey || !workspaceId) {
		return giveUp("QuickDash is not configured (check NEXT_PUBLIC_QUICKDASH_*)");
	}

	try {
		const response = await fetch(
			`${baseUrl}/v1/partner-links/${encodeURIComponent(slug)}`,
			{
				headers: {
					"QuickEngine-Workspace": workspaceId,
					"QuickEngine-Publishable-Key": siteKey,
				},
				// Codes are created and retired by hand; a short cache keeps a viral
				// link from becoming a request per visitor while staying current.
				next: { revalidate: 60 },
			},
		);
		if (!response.ok) {
			return giveUp(
				`the API answered ${response.status} — is the workspace id right for this database, and is the site key valid there?`,
			);
		}

		const body = (await response.json()) as {
			data?: { link?: { code: string; discountCode: string | null } | null };
		};
		const link = body.data?.link;

		/**
		 * 🔴 An unknown or retired code redirects silently to the shop.
		 *
		 * The visitor came to buy coffee. Whether an affiliate arrangement is
		 * still current is a matter between the business and that partner, and
		 * showing a stranger an error about it turns somebody else's expired
		 * agreement into the customer's problem.
		 */
		if (!link) return giveUp("no active partner code with that name");

		const redirect = NextResponse.redirect(home);
		const options = {
			maxAge: REMEMBER_FOR_DAYS * 24 * 60 * 60,
			path: "/",
			sameSite: "lax" as const,
			secure: process.env.NODE_ENV === "production",
		};
		// Who gets the credit. Read at checkout so the order is attributed.
		redirect.cookies.set("caffeinate_ref", link.code, options);
		// What the visitor gets. Separate cookie because either can exist alone:
		// a link can attribute an order without discounting it.
		if (link.discountCode) {
			redirect.cookies.set("caffeinate_discount", link.discountCode, options);
		}
		/**
		 * A one-shot marker so the site can say "15% off applied" exactly once.
		 *
		 * 🔑 Separate from the two long-lived cookies because it answers a
		 * different question: those say WHAT applies, this says somebody just
		 * arrived. Reusing them would mean greeting a returning shopper with the
		 * same announcement every visit for a month.
		 *
		 * Short-lived and deleted by the client the moment it is shown.
		 */
		redirect.cookies.set("caffeinate_ref_arrived", link.discountCode ?? "", {
			...options,
			maxAge: 120,
		});
		return redirect;
	} catch (error) {
		// A partner link must never be the reason somebody cannot reach the shop.
		return giveUp(
			error instanceof Error ? error.message : "the request failed",
		);
	}
}
