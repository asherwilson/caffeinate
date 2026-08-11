import type { ReactNode } from "react";

export type ContentSection = {
  body: ReactNode;
  index: string;
  title: string;
};

export function PageContent({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="page-content">
      {sections.map((section) => (
        <section className="content-section" key={section.index}>
          <p className="content-index">{section.index}</p>
          <h2>{section.title}</h2>
          <div className="content-body">{section.body}</div>
        </section>
      ))}
    </div>
  );
}
