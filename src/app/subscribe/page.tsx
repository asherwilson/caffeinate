import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";
import { SubscriptionPlans } from "@/components/subscription-plans";

/**
 * Recurring billing has landed, so section 05 is the plan picker it was always
 * meant to be.
 *
 * ⚠️ The picker renders whatever the shop actually offers. With no plans
 * published it says so plainly rather than showing an empty heading, because an
 * empty "choose a plan" reads as broken rather than as not-yet-opened.
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
            index: "05 / STANDING ORDERS",
            title: "PICK YOUR INTERVAL.",
            body: <SubscriptionPlans />,
          },
        ]}
      />
    </InteriorPage>
  );
}
