import { InteriorPage } from "@/components/interior-page";
import { PageContent } from "@/components/page-content";

export default function AboutPage() {
  return (
    <InteriorPage
      description="A SMALL COFFEE SYSTEM FOR PEOPLE WHO REFUSE TO POWER DOWN."
      eyebrow="// ABOUT / ORIGIN_PROCESS"
      title={"BUILT FOR UPTIME."}
    >
      <PageContent
        sections={[
          {
            body: (
              <p>
                Caffeinate makes direct, useful coffee without the lifestyle
                monologue. Good beans, clear specifications, repeatable results.
              </p>
            ),
            index: "01 / PURPOSE",
            title: "COFFEE IS INFRASTRUCTURE.",
          },
          {
            body: (
              <p>
                We roast in small releases, publish the useful details, and keep
                the catalog deliberately tight. No mystery blend names. No fake
                scarcity counters.
              </p>
            ),
            index: "02 / METHOD",
            title: "SMALL BATCH. FULL TRACE.",
          },
          {
            body: (
              <p>
                Built in Canada for developers, designers, night operators,
                early starters, and anyone else whose day begins with a loading
                screen.
              </p>
            ),
            index: "03 / USERS",
            title: "FOR PEOPLE STILL RUNNING.",
          },
        ]}
      />
    </InteriorPage>
  );
}
