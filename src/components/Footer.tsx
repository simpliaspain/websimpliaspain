import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { EMAIL, PHONE_ALT, PHONE_MAIN, demoUrl } from "@/lib/site";

/**
 * Four plain columns on one hairline (redesign, 05/11/2026): the mark and
 * where the data lives, the links, how to reach a person, and the two
 * account links. No icons, no surface, no social row - the redesign spends
 * its attention on the page, not on the foot of it.
 */
export function Footer() {
  const { t } = useLanguage();

  const link =
    "flex min-h-[44px] items-center text-foreground transition-colors hover:text-link hover:underline motion-reduce:transition-none";

  return (
    <footer className="border-t border-border bg-background text-muted-foreground">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-8 gap-y-6 px-5 pb-6 pt-10 text-[15px] sm:px-8 lg:px-12">
        <div className="grid content-start gap-2">
          <Link
            to="/"
            aria-label={t("nav.homeAria")}
            className="flex min-h-[44px] items-center text-xl font-bold tracking-[-0.02em] text-foreground"
          >
            Simplia<span className="text-brand">Spain</span>
            <span aria-hidden="true" className="mt-[7px] self-start text-[11px] font-semibold text-brand">
              ®
            </span>
          </Link>
          <span>{t("footer.euHosted")}</span>
        </div>

        <nav aria-label={t("footer.product")} className="grid content-start">
          <Link to="/como-trabajamos" className={link}>
            {t("footer.howWeWork")}
          </Link>
          <a
            href={demoUrl("web")}
            target="_blank"
            rel="noopener"
            className={link}
            data-umami-event="demo"
            data-umami-event-lugar="pie"
          >
            {t("cta.demo")}
            <span className="sr-only"> {t("nav.opensNewTab")}</span>
          </a>
          <a href="/#caso" className={link}>
            {t("nav.case")}
          </a>
        </nav>

        <div className="grid content-start">
          <Link to="/contacto" className={link}>
            {t("nav.contact")}
          </Link>
          <a href={`mailto:${EMAIL}`} className={link}>
            {EMAIL}
          </a>
          <a href={PHONE_MAIN.href} className={link}>
            {PHONE_MAIN.display}
          </a>
          <a href={PHONE_ALT.href} className={`${link} text-[13px] text-muted-foreground`}>
            {t("footer.altPhone")}: {PHONE_ALT.display}
          </a>
        </div>

        <div className="grid content-start">
          <a
            href="https://panel.simpliaspain.com/?ref=footer"
            target="_blank"
            rel="noopener"
            aria-label={`${t("nav.clientAccess")} ${t("nav.opensNewTab")}`}
            className={link}
          >
            {t("nav.clientAccess")}
          </a>
          <Link to="/politica-privacidad" className={link}>
            {t("footer.privacyPolicy")}
          </Link>
        </div>
      </div>

      <p className="mx-auto w-full max-w-[1240px] px-5 pb-8 text-sm sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Simplia Spain
      </p>
    </footer>
  );
}
