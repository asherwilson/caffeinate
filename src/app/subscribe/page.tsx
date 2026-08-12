import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

/**
 * ⚠️ The offer is real, the billing is not — QuickDash has no recurring
 * charges yet, so there is deliberately no signup button here. A subscribe
 * button that took a one-off payment and quietly never charged again would be
 * the worst possible version of this page.
 *
 * When recurring billing lands, section 05 becomes the plan picker and this
 * comment goes away.
 */
export default function SubscribePage() {
  return (
    <InteriorPage
      description="COFFEE ON A SCHEDULE. NEVER RUN THE POT DRY AGAIN."
      eyebrow="// SUBSCRIBE / STANDING_ORDER"
      title="ALWAYS ON."
    >
      <PageContent
        sections={[
          {
            index: "01 / CADENCE",
            title: "PICK AN INTERVAL.",
            body: (
              <p>
                Weekly for an office or a two-cup-a-day habit, fortnightly for
                most people, monthly for a single careful drinker. Every bag
                ships within a day of roast, so the interval you choose is the
                freshness you get.
              </p>
            ),
          },
          {
            index: "02 / SELECTION",
            title: "FIXED OR ROTATING.",
            body: (
              <p>
                Lock to one coffee and get the same bag every time, or take the
                rotating slot and receive whatever came off the roaster best
                that week. The rotating slot is how most people find the coffee
                they end up locking to.
              </p>
            ),
          },
          {
            index: "03 / CONTROL",
            title: "SKIP, PAUSE, CANCEL.",
            body: (
              <p>
                Every subscription is managed from your account. Skip a single
                delivery, push the whole schedule back while you travel, change
                the coffee, or cancel outright. No phone call, no retention
                script, no notice period.
              </p>
            ),
          },
          {
            index: "04 / PRICE",
            title: "CHEAPER THAN BUYING TWICE.",
            body: (
              <p>
                Subscribers pay less per bag than the shop price and shipping is
                included on every delivery. The saving is applied at each
                charge, not as a coupon you have to remember.
              </p>
            ),
          },
          {
            index: "05 / STATUS",
            title: "NOT OPEN YET.",
            body: (
              <p>
                Recurring billing is still being built, so there is nothing to
                sign up to on this page today — we would rather say that than
                take a payment we cannot repeat properly. Send a note through
                Contact and you will be first told when it opens. Until then,
                everything in the shop is available to order one bag at a time.
              </p>
            ),
          },
        ]}
      />
    </InteriorPage>
  );
}
