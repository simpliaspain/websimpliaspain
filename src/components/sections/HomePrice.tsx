import { useLanguage } from "@/contexts/LanguageContext";
import { CallLink } from "@/components/DemoLinks";
import { Reveal } from "@/components/Reveal";
import { StatHeading } from "@/components/StatHeading";

/**
 * What it costs, as a rule rather than a number.
 *
 * The redesign took the old pricing band out, and it was right to: a pricing
 * section with no amounts in it subtracts. This one has no amounts either,
 * but it has something better - the rule that produces them. A tenth of the
 * value the agent creates, whatever that turns out to be, which is a claim
 * an operator can check against their own month rather than a range to
 * haggle over.
 *
 * The ladder stops at 100.000 EUR. The rule carries on and the line under it
 * says so, but a table that runs to a billion euros a month in a page aimed
 * at people who run four buildings reads as a joke and takes the real rows
 * down with it.
 *
 * The figure is set the way the case band sets its percentage, and for the
 * same reason - one run of text, said once to everyone - but smaller, so the
 * two bands rhyme without competing.
 */
export function HomePrice() {
  const { t } = useLanguage();

  const rows = [1, 2, 3].map((n) => ({
    value: t(`price.row${n}Value`),
    fee: t(`price.row${n}Fee`),
  }));

  return (
    <section
      id="precio"
      aria-labelledby="h-precio"
      className="scroll-mt-[68px] border-t border-border py-[clamp(64px,9vw,136px)]"
    >
      <div className="wrap">
        <Reveal>
          <StatHeading id="h-precio" figure={t("price.figure")} size="md">
            {t("price.figureText")}
          </StatHeading>
        </Reveal>

        {/* Three items rather than two columns, so that stacked the reader
            gets the rule, then the proof of it, then the way to ask - the
            button after the evidence instead of between the prose and it. */}
        <div className="mt-[clamp(36px,5vw,64px)] grid gap-x-[clamp(24px,5vw,72px)] gap-y-10 md:grid-cols-2">
          <Reveal className="min-w-0 md:col-start-1 md:row-start-1">
            <p className="m-0 max-w-[46ch] text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-foreground">
              {t("price.lead")}
            </p>
          </Reveal>

          {/* The rule, worked out. Two columns on hairlines, the same shape
              the month's numbers use further up the page. */}
          <Reveal delay={90} className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
            <div className="grid grid-cols-2 gap-x-6 border-b border-border pb-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>{t("price.colValue")}</span>
              <span className="text-right">{t("price.colFee")}</span>
            </div>
            <ul className="m-0 list-none p-0">
              {rows.map((r) => (
                <li
                  key={r.value}
                  className="grid grid-cols-2 items-baseline gap-x-6 border-b border-border py-[clamp(14px,1.6vw,20px)]"
                >
                  <span className="whitespace-nowrap text-[clamp(20px,2vw,27px)] font-bold leading-none tracking-[-0.03em] text-foreground tabular-nums">
                    {r.value}
                  </span>
                  <span className="whitespace-nowrap text-right text-[clamp(20px,2vw,27px)] font-bold leading-none tracking-[-0.03em] text-brand tabular-nums">
                    {r.fee}
                  </span>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              {t("price.anyScale")}
            </p>
          </Reveal>

          {/* Not revealed. Everything around it comes up; the one thing on
              the band you might reach for stays still, because a button that
              is still moving slides out from under the pointer. */}
          <div className="md:col-start-1 md:row-start-2">
            <CallLink lugar="precio" />
          </div>
        </div>
      </div>
    </section>
  );
}
