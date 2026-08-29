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
export default function AboutPage() {
  const content = useContent();

  return (
    <InteriorPage
      description={content("about.description")}
      eyebrow={content("about.eyebrow")}
      title={content("about.title")}
    >
      <PageContent
        sections={[
          {
            body: <p>{content("about.s1.body")}</p>,
            index: "01 / PURPOSE",
            title: content("about.s1.title"),
          },
          {
            body: <p>{content("about.s2.body")}</p>,
            index: "02 / METHOD",
            title: content("about.s2.title"),
          },
          {
            body: <p>{content("about.s3.body")}</p>,
            index: "03 / USERS",
            title: content("about.s3.title"),
          },
        ]}
      />
    </InteriorPage>
  );
}
