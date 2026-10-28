import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";
import { ImpactCounter } from "@/components/ImpactCounter";

/**
 * Right under the hero: the client the agent already works for, and the live
 * counter. The counter renders nothing until real figures arrive, so on its
 * own this strip is one line.
 */
export function TrustSection() {
  const { t } = useLanguage();
  return (
    <Section variant="tight" aria-label={`${t("trust.worksAt")} ${t("trust.client")}`} className="relative bg-background">
      <div className="container">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-base text-muted-foreground">
          <BadgeCheck aria-hidden="true" className="h-5 w-5 text-primary" />
          {t("trust.worksAt")}
          <a href="#caso" className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground">
            {t("trust.client")}
          </a>
          <span>· {t("trust.clientDesc")}</span>
        </p>
        <ImpactCounter />
      </div>
    </Section>
  );
}
