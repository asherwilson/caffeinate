/**
 * Every word and picture on this site that the shop owner can change.
 *
 * ── One declaration, three jobs ──────────────────────────────────────────────
 *
 * 🔑 This file is the ONLY place a slot is described, and it produces all three
 * things a slot needs:
 *
 *   1. the MANIFEST QuickDash renders — label, type and group come from here,
 *      so the Content screen shows "Headline" under "Home / hero" rather than a
 *      raw key nobody can identify;
 *   2. the SEED — `value` is this site's current copy, written into the slot the
 *      first time it is empty, so the operator opens Content and sees the real
 *      words instead of a column of blank boxes;
 *   3. the FALLBACK — what renders when the slot has no value, which is what
 *      keeps the site whole if QuickDash is unreachable.
 *
 * 🔴 Keeping these in three places is how a CMS rots. The manifest drifts from
 * what the site reads, a renamed key silently renders nothing, and the operator
 * edits a slot that no longer appears anywhere. One object cannot drift from
 * itself.
 *
 * ⚠️ Keys are lowercase — letters, numbers, dots, dashes, underscores. QuickDash
 * rejects anything else, so `primaryCta` is `primary-cta`.
 *
 * ⚠️ A key is a PROMISE. Renaming one abandons whatever the owner typed into the
 * old one, because the value is stored against the key. Add and deprecate;
 * never rename in place.
 */
export type SlotType = "text" | "richtext" | "image";

export type SlotDefinition = {
  type: SlotType;
  /**
   * `list` means the slot holds MANY of its type — a gallery of pictures rather
   * than one. Defaults to a single value when omitted.
   */
  kind?: "single" | "list";
  label: string;
  group: string;
  /** This site's current copy — the seed, and the fallback. */
  value: string;
};

/**
 * ⚠️ `as const satisfies` rather than a plain annotation: it keeps the literal
 * KEYS in the type, so `content("home.hero.headine")` is a compile error rather
 * than an empty string nobody notices until it is live.
 */
export const SLOTS = {
  // ── Home / hero ──────────────────────────────────────────────────────────
  "home.hero.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Home / hero",
    value: "// SPECIALTY_COFFEE / ROASTED_IN_CANADA",
  },
  "home.hero.headline": {
    type: "text",
    label: "Headline",
    group: "Home / hero",
    // Line breaks are meaningful here and are preserved on render, so the
    // owner controls where the words wrap without touching code.
    value: "COFFEE FOR\nLONG\nSESSIONS.",
  },
  "home.hero.copy": {
    type: "text",
    label: "Supporting line",
    group: "Home / hero",
    value: "TRACEABLE, SMALL-BATCH COFFEE\nFOR PEOPLE WHO BUILD THINGS.",
  },
  "home.hero.primary-cta": {
    type: "text",
    label: "Main button",
    group: "Home / hero",
    value: "SHOP COFFEE",
  },
  "home.hero.secondary-cta": {
    type: "text",
    label: "Second button",
    group: "Home / hero",
    value: "FIND YOUR ROAST",
  },

  /**
   * ── Home / hero backdrop ────────────────────────────────────────────────
   *
   * 🔑 ONE slot holding as many pictures as the owner wants, not a fixed number
   * of numbered slots.
   *
   * ⚠️ The first attempt here was `backdrop1`, `backdrop2`, `backdrop3`, and it
   * was wrong for an obvious reason: the number of pictures a shop can show
   * would be decided by whoever wrote this file, and a fourth would be a code
   * change and a deploy. A gallery is `kind: "list"`, which the content module
   * already supported — it simply had no control, so it rendered as a JSON
   * textarea nobody could use.
   *
   * 🔴 These were stock photographs of coffee that was never for sale, removed
   * on 2026-08-22 with the note that marketing imagery "belongs in the content
   * module and will be chosen rather than inherited from a template". This is
   * that.
   */
  "home.hero.backdrops": {
    type: "image",
    kind: "list",
    label: "Backdrop pictures",
    group: "Home / hero",
    // Seeded empty: an invented stock photo is exactly what was removed.
    value: "",
  },
  // ── Home / featured roast ────────────────────────────────────────────────
  "home.featured.label": {
    type: "text",
    label: "Section label",
    group: "Home / featured roast",
    value: "// COFFEE_0001 / FEATURED_ROAST",
  },
  /**
   * 🔴 The empty frame on the home page.
   *
   * A stock photograph sat here presented as this business's own, and was
   * removed rather than replaced — "marketing imagery is chosen, and until it
   * is chosen an empty frame is the truth". This is where it gets chosen.
   */
  "home.featured.image": {
    type: "image",
    label: "Roast photo",
    group: "Home / featured roast",
    value: "",
  },
  "home.featured.badge": {
    type: "text",
    label: "Photo caption",
    group: "Home / featured roast",
    value: "ROAST / 0001",
  },
  "home.featured.title": {
    type: "text",
    label: "Heading",
    group: "Home / featured roast",
    value: "HOUSE\nPROCESS.",
  },
  "home.featured.copy": {
    type: "text",
    label: "Description",
    group: "Home / featured roast",
    value: "BALANCED AND SWEET.\nCHOCOLATE FORWARD.\nMADE FOR EVERY DAY.",
  },
  "home.featured.origin": {
    type: "text",
    label: "Origin",
    group: "Home / featured roast",
    value: "COLOMBIA",
  },
  "home.featured.process": {
    type: "text",
    label: "Process",
    group: "Home / featured roast",
    value: "WASHED",
  },
  "home.featured.altitude": {
    type: "text",
    label: "Altitude",
    group: "Home / featured roast",
    value: "1,800M",
  },
  "home.featured.roast": {
    type: "text",
    label: "Roast level",
    group: "Home / featured roast",
    value: "MEDIUM",
  },
  "home.featured.notes": {
    type: "text",
    label: "Tasting notes",
    group: "Home / featured roast",
    value: "CHOCOLATE / CARAMEL / BROWN SUGAR",
  },
  "home.featured.primary-cta": {
    type: "text",
    label: "Main button",
    group: "Home / featured roast",
    value: "VIEW COFFEE",
  },
  "home.featured.secondary-cta": {
    type: "text",
    label: "Second button",
    group: "Home / featured roast",
    value: "ADD TO CART",
  },

  // ── Home / brew guide ────────────────────────────────────────────────────
  "home.brew.label": {
    type: "text",
    label: "Section label",
    group: "Home / brew guide",
    value: "// BREW_PROTOCOL / SELECT_RUNTIME",
  },
  "home.brew.title": {
    type: "text",
    label: "Heading",
    group: "Home / brew guide",
    value: "COMPILE\nA BETTER\nCUP.",
  },
  "home.brew.copy": {
    type: "text",
    label: "Description",
    group: "Home / brew guide",
    value: "PICK A RUNTIME.\nWE'LL HANDLE THE PARAMETERS.",
  },
  "home.brew.cta": {
    type: "text",
    label: "Button",
    group: "Home / brew guide",
    value: "OPEN FULL PROTOCOL",
  },

  // ── Home / subscription ──────────────────────────────────────────────────
  "home.subscribe.label": {
    type: "text",
    label: "Section label",
    group: "Home / subscription",
    value: "// BACKGROUND_PROCESS / RECURRING_DELIVERY",
  },
  "home.subscribe.title": {
    type: "text",
    label: "Heading",
    group: "Home / subscription",
    value: "NEVER RUN\nOUT AGAIN.",
  },
  "home.subscribe.copy": {
    type: "text",
    label: "Description",
    group: "Home / subscription",
    value: "COFFEE ARRIVES BEFORE\nYOUR SUPPLY REACHES ZERO.",
  },
  "home.subscribe.cta": {
    type: "text",
    label: "Button",
    group: "Home / subscription",
    value: "START PROCESS",
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  "footer.label": {
    type: "text",
    label: "Wordmark line",
    group: "Footer",
    value: "// CAFFEINATE® / SPECIALTY_COFFEE",
  },
  "footer.title": {
    type: "text",
    label: "Heading",
    group: "Footer",
    value: "STAY\nAWAKE.",
  },
  "footer.copy": {
    type: "text",
    label: "Description",
    group: "Footer",
    value: "SMALL-BATCH COFFEE.\nBUILT FOR LONG SESSIONS.",
  },
  "footer.cta": {
    type: "text",
    label: "Button",
    group: "Footer",
    value: "SHOP COFFEE",
  },
  "footer.status": {
    type: "text",
    label: "Status",
    group: "Footer",
    value: "OPERATIONAL",
  },
  "footer.roasting": {
    type: "text",
    label: "Roasting in",
    group: "Footer",
    value: "CANADA",
  },
  "footer.support": {
    type: "text",
    label: "Support",
    group: "Footer",
    value: "HUMAN",
  },

  /**
   * ── Interior pages ────────────────────────────────────────────────────────
   *
   * 🔑 Generated from the pages themselves rather than retyped, so the seeded
   * value is EXACTLY the copy the site already shows. Transcribing ninety
   * strings by hand is ninety chances to introduce a difference nobody would
   * ever notice — a changed comma seeds wrong and then the "original" the Reset
   * button restores is not the original at all.
   *
   * ⚠️ Section bodies are `richtext`. They are prose paragraphs rather than
   * labels, and marking them as such is what lets the editor eventually offer a
   * proper editor instead of a single-line box.
   */

  // ── About ──
  "about.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "About",
    value: "// ABOUT / ORIGIN_PROCESS",
  },
  "about.title": {
    type: "text",
    label: "Heading",
    group: "About",
    value: "BUILT FOR UPTIME.",
  },
  "about.description": {
    type: "text",
    label: "Intro line",
    group: "About",
    value: "A SMALL COFFEE SYSTEM FOR PEOPLE WHO REFUSE TO POWER DOWN.",
  },
  "about.s1.title": {
    type: "text",
    label: "01 / PURPOSE — heading",
    group: "About",
    value: "COFFEE IS INFRASTRUCTURE.",
  },
  "about.s1.body": {
    type: "richtext",
    label: "01 / PURPOSE — text",
    group: "About",
    value:
      "Caffeinate makes direct, useful coffee without the lifestyle monologue. Good beans, clear specifications, repeatable results.",
  },
  "about.s2.title": {
    type: "text",
    label: "02 / METHOD — heading",
    group: "About",
    value: "SMALL BATCH. FULL TRACE.",
  },
  "about.s2.body": {
    type: "richtext",
    label: "02 / METHOD — text",
    group: "About",
    value:
      "We roast in small releases, publish the useful details, and keep the catalog deliberately tight. No mystery blend names. No fake scarcity counters.",
  },
  "about.s3.title": {
    type: "text",
    label: "03 / USERS — heading",
    group: "About",
    value: "FOR PEOPLE STILL RUNNING.",
  },
  "about.s3.body": {
    type: "richtext",
    label: "03 / USERS — text",
    group: "About",
    value:
      "Built in Canada for developers, designers, night operators, early starters, and anyone else whose day begins with a loading screen.",
  },

  // ── Returns ──
  "returns.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Returns",
    value: "// RETURNS / RECOVERY_PROTOCOL",
  },
  "returns.title": {
    type: "text",
    label: "Heading",
    group: "Returns",
    value: "RECOVERY MODE.",
  },
  "returns.description": {
    type: "text",
    label: "Intro line",
    group: "Returns",
    value: "CLEAR RECOVERY RULES FOR INCORRECT OR DAMAGED OUTPUT.",
  },
  "returns.s1.title": {
    type: "text",
    label: "01 / COFFEE — heading",
    group: "Returns",
    value: "PERISHABLE BY DESIGN.",
  },
  "returns.s1.body": {
    type: "richtext",
    label: "01 / COFFEE — text",
    group: "Returns",
    value:
      "Opened coffee cannot be returned for preference alone. If the coffee or shipment is defective, we will investigate and make it right.",
  },
  "returns.s2.title": {
    type: "text",
    label: "02 / GEAR — heading",
    group: "Returns",
    value: "UNUSED HARDWARE.",
  },
  "returns.s2.body": {
    type: "richtext",
    label: "02 / GEAR — text",
    group: "Returns",
    value:
      "Unused, unopened non-perishable goods may be eligible for return within thirty days. Return shipping may apply.",
  },
  "returns.s3.title": {
    type: "text",
    label: "03 / START — heading",
    group: "Returns",
    value: "OPEN A TICKET.",
  },
  "returns.s3.body": {
    type: "richtext",
    label: "03 / START — text",
    group: "Returns",
    value:
      "Contact us with the order number before sending anything back. Unregistered returns cannot be matched to an account.",
  },

  // ── Shipping ──
  "shipping.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Shipping",
    value: "// SHIPPING / DELIVERY_PROTOCOL",
  },
  "shipping.title": {
    type: "text",
    label: "Heading",
    group: "Shipping",
    value: "DELIVERY PROTOCOL.",
  },
  "shipping.description": {
    type: "text",
    label: "Intro line",
    group: "Shipping",
    value: "ROASTED, PACKED, AND DISPATCHED WITH A TRACEABLE ROUTE.",
  },
  "shipping.s1.title": {
    type: "text",
    label: "01 / PROCESS — heading",
    group: "Shipping",
    value: "ROAST THEN ROUTE.",
  },
  "shipping.s1.body": {
    type: "richtext",
    label: "01 / PROCESS — text",
    group: "Shipping",
    value:
      "Orders enter the next available roast and fulfillment cycle. Tracking is transmitted when the carrier accepts the package.",
  },
  "shipping.s2.title": {
    type: "text",
    label: "02 / COVERAGE — heading",
    group: "Shipping",
    value: "CANADA FIRST.",
  },
  "shipping.s2.body": {
    type: "richtext",
    label: "02 / COVERAGE — text",
    group: "Shipping",
    value:
      "Initial service covers Canadian addresses. Rates and delivery estimates are calculated at checkout from the actual destination.",
  },
  "shipping.s3.title": {
    type: "text",
    label: "03 / DAMAGE — heading",
    group: "Shipping",
    value: "REPORT A BAD PACKET.",
  },
  "shipping.s3.body": {
    type: "richtext",
    label: "03 / DAMAGE — text",
    group: "Shipping",
    value:
      "If a shipment arrives damaged or incorrect, send the order number and photographs through Contact within seven days.",
  },

  // ── Privacy ──
  "privacy.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Privacy",
    value: "// PRIVACY / DATA_POLICY",
  },
  "privacy.title": {
    type: "text",
    label: "Heading",
    group: "Privacy",
    value: "PRIVATE BY DEFAULT.",
  },
  "privacy.description": {
    type: "text",
    label: "Intro line",
    group: "Privacy",
    value: "THE MINIMUM DATA REQUIRED TO PROCESS THE REQUEST.",
  },
  "privacy.s1.title": {
    type: "text",
    label: "01 / COLLECTION — heading",
    group: "Privacy",
    value: "ONLY USEFUL INPUT.",
  },
  "privacy.s1.body": {
    type: "richtext",
    label: "01 / COLLECTION — text",
    group: "Privacy",
    value:
      "We collect information needed to operate accounts, fulfill purchases, prevent abuse, and answer support requests.",
  },
  "privacy.s2.title": {
    type: "text",
    label: "02 / PROCESSORS — heading",
    group: "Privacy",
    value: "LIMITED SUBSYSTEMS.",
  },
  "privacy.s2.body": {
    type: "richtext",
    label: "02 / PROCESSORS — text",
    group: "Privacy",
    value:
      "Payment, delivery, analytics, and infrastructure providers receive only the information required to perform their function.",
  },
  "privacy.s3.title": {
    type: "text",
    label: "03 / CONTROL — heading",
    group: "Privacy",
    value: "REQUEST ACCESS OR DELETION.",
  },
  "privacy.s3.body": {
    type: "richtext",
    label: "03 / CONTROL — text",
    group: "Privacy",
    value:
      "Contact us to request a copy, correction, or deletion of eligible personal information. Legal and fraud-prevention retention may still apply.",
  },

  // ── Terms ──
  "terms.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Terms",
    value: "// TERMS / SERVICE_AGREEMENT",
  },
  "terms.title": {
    type: "text",
    label: "Heading",
    group: "Terms",
    value: "TERMS OF SERVICE.",
  },
  "terms.description": {
    type: "text",
    label: "Intro line",
    group: "Terms",
    value: "THE CONDITIONS THAT APPLY TO EVERY ORDER PLACED HERE.",
  },
  "terms.s1.title": {
    type: "text",
    label: "01 / AGREEMENT — heading",
    group: "Terms",
    value: "PLACING AN ORDER ACCEPTS THIS.",
  },
  "terms.s1.body": {
    type: "richtext",
    label: "01 / AGREEMENT — text",
    group: "Terms",
    value:
      "Browsing, creating an account, or submitting an order means these terms apply to you. If you do not accept them, do not place an order. We may revise these terms; the version published here at the time of your order is the one that governs it.",
  },
  "terms.s2.title": {
    type: "text",
    label: "02 / ACCOUNTS — heading",
    group: "Terms",
    value: "ONE SIGN-IN, YOUR RESPONSIBILITY.",
  },
  "terms.s2.body": {
    type: "richtext",
    label: "02 / ACCOUNTS — text",
    group: "Terms",
    value:
      "Sign-in is passwordless and tied to your email address. You are responsible for activity on your account and for keeping access to that inbox secure. Tell us immediately if you believe someone else is using it. We may suspend an account we reasonably believe is being used for fraud or abuse.",
  },
  "terms.s3.title": {
    type: "text",
    label: "03 / PRICING — heading",
    group: "Terms",
    value: "THE SERVER PRICE IS THE PRICE.",
  },
  "terms.s3.body": {
    type: "richtext",
    label: "03 / PRICING — text",
    group: "Terms",
    value:
      "Prices, stock, shipping rates, and taxes are calculated by our systems at checkout and are authoritative over anything a cached page may display. All amounts are in Canadian dollars unless stated otherwise. If an order is priced in obvious error, or the item turns out to be unavailable, we may cancel it and refund you in full rather than fulfill it.",
  },
  "terms.s4.title": {
    type: "text",
    label: "04 / PAYMENT — heading",
    group: "Terms",
    value: "AUTHORIZED, THEN CAPTURED.",
  },
  "terms.s4.body": {
    type: "richtext",
    label: "04 / PAYMENT — text",
    group: "Terms",
    value:
      "Payments are processed by Stripe. We do not receive or store your full card number. Submitting a payment authorizes the total shown at checkout, including shipping and tax. An order is accepted when payment settles, not when the form is submitted — a confirmation email is an acknowledgement of your request, not a guarantee of fulfillment.",
  },
  "terms.s5.title": {
    type: "text",
    label: "05 / FULFILLMENT — heading",
    group: "Terms",
    value: "A PERISHABLE GOOD.",
  },
  "terms.s5.body": {
    type: "richtext",
    label: "05 / FULFILLMENT — text",
    group: "Terms",
    value:
      "Coffee is roasted to order and dispatched under the terms on the Shipping page. Returns, damage, and defect handling are governed by the Returns page, and both are part of this agreement. Risk of loss passes when the carrier delivers to the address you provided; we are not responsible for an address entered incorrectly.",
  },
  "terms.s6.title": {
    type: "text",
    label: "06 / CONDUCT — heading",
    group: "Terms",
    value: "DO NOT BREAK THE SHOP.",
  },
  "terms.s6.body": {
    type: "richtext",
    label: "06 / CONDUCT — text",
    group: "Terms",
    value:
      "Do not attempt to disrupt the service, probe it for vulnerabilities without permission, scrape it at volume, resell access to it, or use it to break the law. Our name, branding, photography, and page copy remain ours and may not be reused without written permission.",
  },
  "terms.s7.title": {
    type: "text",
    label: "07 / LIABILITY — heading",
    group: "Terms",
    value: "SOLD AS DESCRIBED.",
  },
  "terms.s7.body": {
    type: "richtext",
    label: "07 / LIABILITY — text",
    group: "Terms",
    value:
      "The store is provided as-is and we do not warrant uninterrupted or error-free operation. Nothing here limits rights you have under applicable consumer-protection law, including any statutory guarantee that cannot be excluded. Subject to that, our liability for any order is limited to the amount you paid for it.",
  },
  "terms.s8.title": {
    type: "text",
    label: "08 / GOVERNING LAW — heading",
    group: "Terms",
    value: "CANADIAN LAW APPLIES.",
  },
  "terms.s8.body": {
    type: "richtext",
    label: "08 / GOVERNING LAW — text",
    group: "Terms",
    value:
      "These terms are governed by the laws of Canada and of the province in which the business operates, without regard to conflict-of-law rules. Questions about these terms go through the Contact page.",
  },

  // ── FAQ ──
  "faq.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "FAQ",
    value: "// FAQ / KNOWN_ISSUES",
  },
  "faq.title": {
    type: "text",
    label: "Heading",
    group: "FAQ",
    value: "FREQUENTLY ASKED.",
  },
  "faq.description": {
    type: "text",
    label: "Intro line",
    group: "FAQ",
    value: "COMMON INPUTS, DIRECT OUTPUTS.",
  },
  "faq.q1.question": {
    type: "text",
    label: "Question 1",
    group: "FAQ",
    value: "WHAT DO YOU SELL?",
  },
  "faq.q1.answer": {
    type: "richtext",
    label: "Answer 1",
    group: "FAQ",
    value:
      "Whole-bean specialty coffee in small, clearly documented releases. Ground options can arrive once the grinding protocol is stable.",
  },
  "faq.q2.question": {
    type: "text",
    label: "Question 2",
    group: "FAQ",
    value: "WHEN DO YOU ROAST?",
  },
  "faq.q2.answer": {
    type: "richtext",
    label: "Answer 2",
    group: "FAQ",
    value:
      "Orders are grouped into frequent roast cycles. The roast date ships with the bag, not hidden behind an arbitrary best-before stamp.",
  },
  "faq.q3.question": {
    type: "text",
    label: "Question 3",
    group: "FAQ",
    value: "WHERE DO YOU SHIP?",
  },
  "faq.q3.answer": {
    type: "richtext",
    label: "Answer 3",
    group: "FAQ",
    value:
      "Canada first. Additional regions will appear only when delivery time and coffee quality can both survive the trip.",
  },
  "faq.q4.question": {
    type: "text",
    label: "Question 4",
    group: "FAQ",
    value: "HOW SHOULD I BREW IT?",
  },
  "faq.q4.answer": {
    type: "richtext",
    label: "Answer 4",
    group: "FAQ",
    value:
      "Each build includes a starting recipe. Treat it as a stable release, then fork it to fit your grinder, water, and preferred level of consciousness.",
  },
  "faq.q5.question": {
    type: "text",
    label: "Question 5",
    group: "FAQ",
    value: "CAN I CHANGE OR CANCEL AN ORDER?",
  },
  "faq.q5.answer": {
    type: "richtext",
    label: "Answer 5",
    group: "FAQ",
    value:
      "Contact us before fulfillment begins. Once a shipment leaves the queue, we cannot intercept the process.",
  },

  // ── Contact ──
  "contact.eyebrow": {
    type: "text",
    label: "Eyebrow",
    group: "Contact",
    value: "// CONTACT / OPEN_CHANNEL",
  },
  "contact.title": {
    type: "text",
    label: "Heading",
    group: "Contact",
    value: "SEND A SIGNAL.",
  },
  "contact.description": {
    type: "text",
    label: "Intro line",
    group: "Contact",
    value: "A HUMAN READS EVERY VALID TRANSMISSION.",
  },
} as const satisfies Record<string, SlotDefinition>;

export type SlotKey = keyof typeof SLOTS;

/** The manifest shape QuickDash's `/v1/content/manage/manifest` expects. */
export function manifestEntries() {
  return Object.entries(SLOTS).map(([key, slot]) => ({
    key,
    type: slot.type,
    kind: "kind" in slot ? slot.kind : ("single" as const),
    label: slot.label,
    group: slot.group,
    value: slot.value,
  }));
}
