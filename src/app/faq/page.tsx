import { InteriorPage } from "@/components/interior-page";

const questions = [
  [
    "WHAT DO YOU SELL?",
    "Whole-bean specialty coffee in small, clearly documented releases. Ground options can arrive once the grinding protocol is stable.",
  ],
  [
    "WHEN DO YOU ROAST?",
    "Orders are grouped into frequent roast cycles. The roast date ships with the bag, not hidden behind an arbitrary best-before stamp.",
  ],
  [
    "WHERE DO YOU SHIP?",
    "Canada first. Additional regions will appear only when delivery time and coffee quality can both survive the trip.",
  ],
  [
    "HOW SHOULD I BREW IT?",
    "Each build includes a starting recipe. Treat it as a stable release, then fork it to fit your grinder, water, and preferred level of consciousness.",
  ],
  [
    "CAN I CHANGE OR CANCEL AN ORDER?",
    "Contact us before fulfillment begins. Once a shipment leaves the queue, we cannot intercept the process.",
  ],
] as const;

export default function FaqPage() {
  return (
    <InteriorPage
      description="COMMON INPUTS, DIRECT OUTPUTS."
      eyebrow="// FAQ / KNOWN_ISSUES"
      title="FREQUENTLY ASKED."
    >
      <div className="faq-list">
        {questions.map(([question, answer], index) => (
          <details key={question} open={index === 0}>
            <summary className="cursor-pointer">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {question}
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </InteriorPage>
  );
}
