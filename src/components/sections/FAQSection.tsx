import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { JsonLd } from "@/components/JsonLd";

/**
 * `hidePhoneAgents` drops the phone-agent question (faq.q2) - and, because the
 * FAQPage JSON-LD is built from the same list, its schema entry - on pages
 * where that service is not offered. The phone agents page itself keeps it.
 */
export function FAQSection({ hidePhoneAgents = false }: { hidePhoneAgents?: boolean } = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    ...(hidePhoneAgents
      ? []
      : [
          {
            question: t('faq.q2'),
            answer: t('faq.a2'),
          },
        ]),
    {
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5'),
    },
    {
      question: t('faq.q6'),
      answer: t('faq.a6'),
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 relative bg-background">
      {/* Same questions and answers as the accordion below, in JSON-LD. */}
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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('faq.badge')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('faq.title')}
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                className={`w-full flex items-center justify-between p-5 bg-card border rounded-xl transition-all text-left group ${
                  openIndex === index 
                    ? "border-primary/30 shadow-sm" 
                    : "border-border hover:border-primary/20"
                }`}
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
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
                animate={
                  openIndex === index
                    ? { height: "auto", opacity: 1 }
                    : { height: 0, opacity: 0 }
                }
                transition={{ duration: 0.2 }}
                aria-hidden={openIndex !== index}
                className="overflow-hidden"
              >
                <div className="p-5 pt-3 text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}