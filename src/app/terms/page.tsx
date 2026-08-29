"use client";

import { useContent } from "@/components/content-store";
import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

/**
 * 🔑 Every word on this page is a content slot, with the copy this file used to
 * hold as its fallback — so it renders identically until somebody edits it, and
 * clearing a slot puts the original back.
 *
 * ⚠️ The section INDEX ("01 / PURPOSE") stays in code. It is the page's
 * numbering scheme rather than its words, and letting it be edited to anything
 * would let the list stop counting.
 */
export default function TermsPage() {
  const content = useContent();

  return (
    <InteriorPage
      description={content("terms.description")}
      eyebrow={content("terms.eyebrow")}
      title={content("terms.title")}
    >
      <PageContent
        sections={[
          {
            body: <p>{content("terms.s1.body")}</p>,
            index: "01 / AGREEMENT",
            title: content("terms.s1.title"),
          },
          {
            body: <p>{content("terms.s2.body")}</p>,
            index: "02 / ACCOUNTS",
            title: content("terms.s2.title"),
          },
          {
            body: <p>{content("terms.s3.body")}</p>,
            index: "03 / PRICING",
            title: content("terms.s3.title"),
          },
          {
            body: <p>{content("terms.s4.body")}</p>,
            index: "04 / PAYMENT",
            title: content("terms.s4.title"),
          },
          {
            body: <p>{content("terms.s5.body")}</p>,
            index: "05 / FULFILLMENT",
            title: content("terms.s5.title"),
          },
          {
            body: <p>{content("terms.s6.body")}</p>,
            index: "06 / CONDUCT",
            title: content("terms.s6.title"),
          },
          {
            body: <p>{content("terms.s7.body")}</p>,
            index: "07 / LIABILITY",
            title: content("terms.s7.title"),
          },
          {
            body: <p>{content("terms.s8.body")}</p>,
            index: "08 / GOVERNING LAW",
            title: content("terms.s8.title"),
          },
        ]}
      />
    </InteriorPage>
  );
}
