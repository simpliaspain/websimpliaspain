import { useLanguage } from "@/contexts/LanguageContext";
import { ClientMark } from "@/components/ClientMark";
import { Reveal } from "@/components/Reveal";
import { StatHeading } from "@/components/StatHeading";

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
        <Reveal>
          <StatHeading id="h-caso" figure={t("case.statValue")}>
            {t("case.statText")}
          </StatHeading>
        </Reveal>

        <ul className="m-0 mt-[clamp(40px,6vw,72px)] grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] border-t border-border p-0">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 70} className="border-b border-border pb-6 pr-5 pt-5">
              <span className="block whitespace-nowrap text-[clamp(36px,3.4vw,52px)] font-bold leading-none tracking-[-0.04em] text-foreground tabular-nums">
                {s.value}
              </span>
              <span className="mt-2.5 block max-w-[240px] text-muted-foreground">{s.label}</span>
            </Reveal>
          ))}
        </ul>

        {/* Whose month this is. Two halves that carry the same weight: the
            mark at the size a mark deserves with the sentence that places
            them underneath, and against it what they said about it, with the
            note on how the figures are counted under that. Side by side as a
            row of three the mark had to be small, the quotation took the
            width, and the note ran the whole page on its own underneath,
            which left the right of the band empty and the band bottom-heavy. */}
        {/* No rule of its own above this: the list of numbers already closes
            on one, and two hairlines a few pixels apart read as a mistake. */}
        <div className="mt-[clamp(36px,5vw,64px)] grid gap-x-[clamp(24px,5vw,72px)] gap-y-9 md:grid-cols-2">
          <Reveal className="min-w-0">
            <ClientMark
              slug="oficinasya"
              name="Oficinas YA!"
              className="m-0"
              imgClassName="h-auto w-full max-w-[min(100%,340px)]"
              href="https://www.oficinasya.es"
              openInNewTab={t("nav.opensNewTab")}
            />
          </Reveal>

          <Reveal delay={90} className="grid min-w-0 content-start">
            <figure className="m-0 grid gap-1.5">
              <blockquote className="m-0 text-[clamp(18px,1.6vw,20px)] font-semibold leading-[1.45] text-foreground">
                {t("case.quote")}
              </blockquote>
              <figcaption className="text-[15px] text-muted-foreground">{t("case.quoteSource")}</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
