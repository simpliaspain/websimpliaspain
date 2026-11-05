import { useLanguage } from "@/contexts/LanguageContext";

/**
 * One operator's own month, led by the figure.
 *
 * Every number is measured over a closed window - October 2026, the
 * oficinasya tenant in Europe/Madrid - rather than read live: the agent
 * keeps working, so a figure that moved on its own would sooner or later
 * disagree with the client's own panel. The window and what "outside office
 * hours" means are printed under the numbers, because a percentage nobody
 * can define is a percentage nobody has to believe.
 *
 * The quote sits with the numbers as their attribution. On its own it is
 * generic; next to them it is a client confirming what they show.
 */
export function HomeCase() {
  const { t } = useLanguage();
  const stats = [1, 2, 3, 4].map((n) => ({
    value: t(`case.stat${n}Value`),
    label: t(`case.stat${n}Label`),
  }));

  return (
    <section
      id="caso"
      aria-labelledby="h-caso"
      className="scroll-mt-[68px] border-t border-border py-[clamp(64px,9vw,136px)]"
    >
      <div className="wrap">
        <div className="flex flex-wrap items-end gap-x-[clamp(24px,4vw,56px)] gap-y-2">
          <p
            aria-hidden="true"
            className="m-0 flex-none whitespace-nowrap text-[clamp(84px,13vw,176px)] font-extrabold leading-[0.86] tracking-[-0.055em] text-brand tabular-nums"
          >
            {t("case.statValue")}
          </p>
          <h2
            id="h-caso"
            className="m-0 mb-[clamp(4px,1vw,14px)] min-w-0 max-w-[640px] flex-[1_1_360px] text-[clamp(24px,2.8vw,38px)] font-extrabold leading-[1.12] text-foreground"
          >
            <span className="sr-only">{t("case.statValue")} </span>
            {t("case.statText")}
          </h2>
        </div>

        <dl className="mt-[clamp(40px,6vw,72px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] border-t border-foreground">
          {/* Term then value in the markup, so each figure is read once and
              with its label; flex-col-reverse puts the number on top. */}
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse border-b border-border pb-6 pr-5 pt-5">
              <dt className="mt-2.5 max-w-[240px] text-muted-foreground">{s.label}</dt>
              <dd className="m-0 whitespace-nowrap text-[clamp(36px,3.4vw,52px)] font-extrabold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-[clamp(24px,3vw,36px)] flex flex-wrap items-start gap-x-[clamp(24px,4vw,64px)] gap-y-5">
          <p className="m-0 min-w-0 flex-[1_1_300px] text-[15px] text-muted-foreground">{t("case.who")}</p>
          <figure className="m-0 grid min-w-0 flex-[1.4_1_420px] gap-1.5">
            <blockquote className="m-0 text-[clamp(18px,1.6vw,20px)] font-semibold leading-[1.45] text-foreground">
              {t("case.quote")}
            </blockquote>
            <figcaption className="text-[15px] text-muted-foreground">{t("case.quoteSource")}</figcaption>
          </figure>
        </div>

        <p className="mt-[clamp(24px,3vw,36px)] text-[13px] leading-relaxed text-muted-foreground">
          {t("case.statsNote")}
        </p>
      </div>
    </section>
  );
}
