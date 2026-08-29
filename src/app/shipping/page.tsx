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
export default function ShippingPage() {
  const content = useContent();

  return (
    <InteriorPage
      description={content("shipping.description")}
      eyebrow={content("shipping.eyebrow")}
      title={content("shipping.title")}
    >
      <PageContent
        sections={[
          {
            body: <p>{content("shipping.s1.body")}</p>,
            index: "01 / PROCESS",
            title: content("shipping.s1.title"),
          },
          {
            body: <p>{content("shipping.s2.body")}</p>,
            index: "02 / COVERAGE",
            title: content("shipping.s2.title"),
          },
          {
            body: <p>{content("shipping.s3.body")}</p>,
            index: "03 / DAMAGE",
            title: content("shipping.s3.title"),
          },
        ]}
      />
    </InteriorPage>
  );
}
