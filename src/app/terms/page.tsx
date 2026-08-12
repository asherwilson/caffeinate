import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

export default function TermsPage() {
  return (
    <InteriorPage
      description="THE CONDITIONS THAT APPLY TO EVERY ORDER PLACED HERE."
      eyebrow="// TERMS / SERVICE_AGREEMENT"
      title={"TERMS OF SERVICE."}
    >
      <PageContent
        sections={[
          {
            index: "01 / AGREEMENT",
            title: "PLACING AN ORDER ACCEPTS THIS.",
            body: (
              <p>
                Browsing, creating an account, or submitting an order means
                these terms apply to you. If you do not accept them, do not
                place an order. We may revise these terms; the version published
                here at the time of your order is the one that governs it.
              </p>
            ),
          },
          {
            index: "02 / ACCOUNTS",
            title: "ONE SIGN-IN, YOUR RESPONSIBILITY.",
            body: (
              <p>
                Sign-in is passwordless and tied to your email address. You are
                responsible for activity on your account and for keeping access
                to that inbox secure. Tell us immediately if you believe someone
                else is using it. We may suspend an account we reasonably
                believe is being used for fraud or abuse.
              </p>
            ),
          },
          {
            index: "03 / PRICING",
            title: "THE SERVER PRICE IS THE PRICE.",
            body: (
              <p>
                Prices, stock, shipping rates, and taxes are calculated by our
                systems at checkout and are authoritative over anything a cached
                page may display. All amounts are in Canadian dollars unless
                stated otherwise. If an order is priced in obvious error, or the
                item turns out to be unavailable, we may cancel it and refund
                you in full rather than fulfill it.
              </p>
            ),
          },
          {
            index: "04 / PAYMENT",
            title: "AUTHORIZED, THEN CAPTURED.",
            body: (
              <p>
                Payments are processed by Stripe. We do not receive or store
                your full card number. Submitting a payment authorizes the total
                shown at checkout, including shipping and tax. An order is
                accepted when payment settles, not when the form is submitted —
                a confirmation email is an acknowledgement of your request, not
                a guarantee of fulfillment.
              </p>
            ),
          },
          {
            index: "05 / FULFILLMENT",
            title: "A PERISHABLE GOOD.",
            body: (
              <p>
                Coffee is roasted to order and dispatched under the terms on the
                Shipping page. Returns, damage, and defect handling are governed
                by the Returns page, and both are part of this agreement. Risk
                of loss passes when the carrier delivers to the address you
                provided; we are not responsible for an address entered
                incorrectly.
              </p>
            ),
          },
          {
            index: "06 / CONDUCT",
            title: "DO NOT BREAK THE SHOP.",
            body: (
              <p>
                Do not attempt to disrupt the service, probe it for
                vulnerabilities without permission, scrape it at volume, resell
                access to it, or use it to break the law. Our name, branding,
                photography, and page copy remain ours and may not be reused
                without written permission.
              </p>
            ),
          },
          {
            index: "07 / LIABILITY",
            title: "SOLD AS DESCRIBED.",
            body: (
              <p>
                The store is provided as-is and we do not warrant uninterrupted
                or error-free operation. Nothing here limits rights you have
                under applicable consumer-protection law, including any
                statutory guarantee that cannot be excluded. Subject to that,
                our liability for any order is limited to the amount you paid
                for it.
              </p>
            ),
          },
          {
            index: "08 / GOVERNING LAW",
            title: "CANADIAN LAW APPLIES.",
            body: (
              <p>
                These terms are governed by the laws of Canada and of the
                province in which the business operates, without regard to
                conflict-of-law rules. Questions about these terms go through
                the Contact page.
              </p>
            ),
          },
        ]}
      />
    </InteriorPage>
  );
}
