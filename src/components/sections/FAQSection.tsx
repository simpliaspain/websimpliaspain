import { useState, type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { JsonLd } from "@/components/JsonLd";

/** The shared questions, in order. Every page that shows an FAQ uses these. */
const SHARED = Array.from({ length: 9 }, (_, i) => [`faq.q${i + 1}`, `faq.a${i + 1}`] as const);

type FAQSectionProps = {
  /** Put the phone-agent question first (only on /agentes-telefonicos). */
  voice?: boolean;
  /** Replace the shared list with a page's own [questionKey, answerKey] pairs. */
  items?: ReadonlyArray<readonly [string, string]>;
  titleKey?: string;
  /** Rendered under the list, on its own rule (the home's press line). */
  footer?: ReactNode;
};

/**
 * Questions on hairlines, with the heading held to the left of them
 * (redesign, 05/11/2026).
 *
 * Opening is pure CSS - a grid row animating between 0fr and 1fr - so the
 * answers are in the prerendered HTML at their real length, crawlers read
 * them, and hydration has no state to disagree about. The first one is open,
 * both in the static markup and on the client.
 *
 * The FAQPage JSON-LD is built from the same list, so the structured data
 * cannot drift from the visible text.
 */
export function FAQSection({ voice = false, items, titleKey = "faq.title", footer }: FAQSectionProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();

  const keys = items ?? [...(voice ? [["faq.voiceQ", "faq.voiceA"] as const] : []), ...SHARED];
  const faqs = keys.map(([q, a]) => ({ question: t(q), answer: t(a) }));

  return (
    <section
      id="faq"
      aria-labelledby="h-faq"
      className="scroll-mt-[68px] border-t border-border py-[clamp(56px,8vw,120px)]"
    >
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <div className="wrap flex flex-wrap items-start gap-[clamp(20px,4vw,72px)]">
        <h2
          id="h-faq"
          className="m-0 min-w-0 flex-[1_1_300px] text-[clamp(28px,3.1vw,42px)] font-bold leading-[1.1] text-foreground"
        >
          {t(titleKey)}
        </h2>

        <div className="min-w-0 flex-[2_1_520px]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="border-t border-border">
                <h3 className="m-0 text-[clamp(18px,1.6vw,21px)] font-semibold leading-[1.3]">
                  <button
                    type="button"
                    id={`faq-b-${index}`}
                    aria-expanded={open}
                    aria-controls={`faq-p-${index}`}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-5 py-[18px] text-left text-foreground transition-colors hover:text-link motion-reduce:transition-none"
                  >
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="relative block h-5 w-5 flex-none transition-transform duration-200 motion-reduce:transition-none"
                      style={{ transform: open ? "rotate(45deg)" : undefined }}
                    >
                      <span className="absolute left-0 top-[9px] h-0.5 w-5 rounded-sm bg-current" />
                      <span className="absolute left-[9px] top-0 h-5 w-0.5 rounded-sm bg-current" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-p-${index}`}
                  role="region"
                  aria-labelledby={`faq-b-${index}`}
                  className="grid transition-[grid-template-rows,visibility] duration-200 motion-reduce:transition-none"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                    visibility: open ? "visible" : "hidden",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="m-0 max-w-[760px] text-pretty pb-[22px] pr-10 text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {footer && <div className="border-t border-border pt-5 text-base text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
