import { useLanguage } from "@/contexts/LanguageContext";
import { ClientMark } from "@/components/ClientMark";

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
 * The 37% is part of the heading rather than a decorative figure beside it.
 * The export set it as an aria-hidden paragraph with the same number
 * repeated in a visually-hidden span, which reads correctly to a screen
 * reader but prints the figure twice in anything that extracts text - a
 * reader mode, a crawler, a copy-paste. One run of text, laid out with
 * flex, says it once to everyone.
 *
 * The numbers are a plain list for the same reason: as a <dl> the label had
 * to come first in the markup and the number was flipped above it with
 * flex-col-reverse, so the page read "conversaciones atendidas en el mes 65"
 * instead of "65 conversaciones atendidas en el mes".
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
        <h2
          id="h-caso"
          className="m-0 flex flex-wrap items-end gap-x-[clamp(24px,4vw,56px)] gap-y-2 text-[clamp(24px,2.8vw,38px)] font-bold leading-[1.12] text-foreground"
        >
          <span className="flex-none whitespace-nowrap text-[clamp(84px,13vw,176px)] leading-[0.86] tracking-[-0.055em] text-brand tabular-nums">
            {t("case.statValue")}
          </span>
          <span className="mb-[clamp(4px,1vw,14px)] min-w-0 max-w-[640px] flex-[1_1_360px] text-balance">
            {t("case.statText")}
          </span>
        </h2>

        <ul className="m-0 mt-[clamp(40px,6vw,72px)] grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] border-t border-foreground p-0">
          {stats.map((s) => (
            <li key={s.label} className="border-b border-border pb-6 pr-5 pt-5">
              <span className="block whitespace-nowrap text-[clamp(36px,3.4vw,52px)] font-bold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                {s.value}
              </span>
              <span className="mt-2.5 block max-w-[240px] text-muted-foreground">{s.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(24px,3vw,36px)] flex flex-wrap items-start gap-x-[clamp(24px,4vw,64px)] gap-y-5">
          {/* Whose month this is: their mark beside the sentence that places
              them. It attributes the numbers, so it belongs here and not up
              by the percentage. */}
          <div className="flex min-w-0 flex-[1_1_300px] items-start gap-4">
            <ClientMark slug="oficinasya" name="Oficinas YA!" className="m-0 flex-none" />
            <p className="m-0 text-[15px] text-muted-foreground">{t("case.who")}</p>
          </div>
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
