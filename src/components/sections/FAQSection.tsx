import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/Section";

/** The shared questions, in order. Every page that shows an FAQ uses these. */
const SHARED = Array.from({ length: 9 }, (_, i) => [`faq.q${i + 1}`, `faq.a${i + 1}`] as const);

type FAQSectionProps = {
  /** Put the phone-agent question first (only on /agentes-telefonicos). */
  voice?: boolean;
  /** Replace the shared list with a page's own [questionKey, answerKey] pairs. */
  items?: ReadonlyArray<readonly [string, string]>;
  titleKey?: string;
};

/**
 * Accordion of questions. The FAQPage JSON-LD is built from the same list, so
 * the structured data cannot drift from the visible text.
 */
export function FAQSection({ voice = false, items, titleKey = "faq.title" }: FAQSectionProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const keys = items ?? [...(voice ? [["faq.voiceQ", "faq.voiceA"] as const] : []), ...SHARED];
  const faqs = keys.map(([q, a]) => ({ question: t(q), answer: t(a) }));

  return (
    <Section id="faq" className="relative scroll-mt-20 bg-background">
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
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">{t(titleKey)}</h2>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                className={`group flex w-full items-center justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                  openIndex === index ? "border-primary/30 shadow-sm" : "border-border hover:border-primary/20"
                }`}
              >
                <span className="pr-4 font-semibold text-foreground">{faq.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === index ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {/* The answer stays in the DOM while collapsed, so it is part of
                  the prerendered HTML that crawlers read; only its height is
                  animated. initial={false} makes the first render match the
                  static markup: collapsed, no layout shift on hydration. */}
              <motion.div
                id={`faq-answer-${index}`}
                initial={false}
                animate={openIndex === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden={openIndex !== index}
                className="overflow-hidden"
              >
                <div className="p-5 pt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
