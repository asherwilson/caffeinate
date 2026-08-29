"use client";

import { useContent } from "@/components/content-store";
import { InteriorPage } from "@/components/interior-page";

/**
 * 🔑 Five question-and-answer slots, numbered.
 *
 * ⚠️ A fixed five rather than a repeatable list, for the same reason the hero
 * backdrop was fixed before it became a gallery: a repeater needs add, remove
 * and reorder in the Content screen, which is a separate piece of work. An
 * empty question is skipped, so four questions work and six need one more slot.
 */
const QUESTIONS = [1, 2, 3, 4, 5] as const;

export default function FaqPage() {
  const content = useContent();

  const entries = QUESTIONS.map((n) => ({
    answer: content(`faq.q${n}.answer` as const),
    question: content(`faq.q${n}.question` as const),
  })).filter((entry) => entry.question.trim() !== "");

  return (
    <InteriorPage
      description={content("faq.description")}
      eyebrow={content("faq.eyebrow")}
      title={content("faq.title")}
    >
      <div className="faq-list">
        {entries.map((entry, index) => (
          <details key={entry.question} open={index === 0}>
            <summary className="cursor-pointer">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {entry.question}
            </summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </div>
    </InteriorPage>
  );
}
