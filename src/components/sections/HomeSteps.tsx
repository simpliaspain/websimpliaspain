import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Reveal } from "@/components/Reveal";

/**
 * Four steps on four rules, from the question to the visit. Numbered because
 * the order is the point; no cards, no icons, no connecting arrows - the
 * rules carry the structure.
 */
export function HomeSteps() {
  const { t } = useLanguage();
  const steps = [1, 2, 3, 4].map((n) => ({
    n: String(n),
    title: t(`steps.s${n}Title`),
    text: t(`steps.s${n}Text`),
  }));

  return (
    <section
      id="como-funciona"
      aria-labelledby="h-como"
      className="scroll-mt-[68px] border-t border-border py-[clamp(56px,8vw,120px)]"
    >
      <div className="wrap">
        <h2
          id="h-como"
          className="m-0 mb-[clamp(28px,4vw,56px)] max-w-[760px] text-[clamp(28px,3.1vw,42px)] font-bold leading-[1.1] text-foreground"
        >
          {t("steps.title")}
        </h2>

        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-x-[clamp(20px,3vw,40px)] p-0">
          {steps.map((s, i) => (
            // In order, 70ms apart: the sequence is the point of the section.
            <Reveal
              as="li"
              key={s.n}
              delay={i * 70}
              className="grid content-start gap-2 border-t border-border pb-7 pt-4"
            >
              <span className="text-[clamp(28px,2.6vw,38px)] font-bold leading-none tracking-[-0.03em] text-brand tabular-nums">
                {s.n}
              </span>
              <span className="text-[19px] font-semibold leading-[1.3] text-foreground">{s.title}</span>
              <span className="text-muted-foreground">{s.text}</span>
            </Reveal>
          ))}
        </ol>

        <p className="mt-2 flex flex-wrap items-center gap-x-[0.35em] text-muted-foreground">
          {t("steps.note")}
          {/* inline-flex with a 44px minimum: it is the home's only link on
              to /como-trabajamos and has to be as easy to hit as a button. */}
          <Link
            to="/como-trabajamos"
            className="inline-flex min-h-[44px] items-center text-link underline underline-offset-2"
          >
            {t("steps.noteLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
