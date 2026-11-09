import { useLanguage } from "@/contexts/LanguageContext";
import { ActionPair } from "@/components/ActionPair";

/**
 * The closing band on every page but the home, which has its own
 * (HomeClosing). Same shape as that one: the question at display size on the
 * left, then the demo and the call. No wash, no glow, no entrance fade.
 */
export function CTASection() {
  const { t } = useLanguage();

  return (
    <section
      id="probar"
      aria-labelledby="h-probar"
      className="scroll-mt-[68px] border-t border-border py-[clamp(64px,9vw,136px)]"
    >
      <div className="wrap grid gap-7">
        <h2
          id="h-probar"
          className="m-0 max-w-[900px] text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] tracking-[-0.035em] text-foreground"
        >
          {t("cta.title")} <span className="text-brand tabular-nums">{t("cta.titleEmph")}</span>?
        </h2>
        <p className="m-0 max-w-[620px] text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
          {t("cta.text")}
        </p>
        <ActionPair lugar="banda-final" />
      </div>
    </section>
  );
}
