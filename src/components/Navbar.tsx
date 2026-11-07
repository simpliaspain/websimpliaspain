import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { MainMenu, MenuGlyph, type MainMenuLink } from "./MainMenu";
import { useMainMenuController } from "@/hooks/use-main-menu";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The header is the logo and one control (redesign, 05/11/2026). Everything
 * else - navigation, client access, the phone, the email, the language -
 * lives in the full-screen menu, so the first screen is the headline and the
 * conversation rather than a row of links competing with them.
 *
 * Two pages stay deliberately unlisted here and in the footer: the phone
 * agent, while the service is not on sale, and /chatbots-multicanal
 * (decided 05/11/2026). Both keep their route and their sitemap entry.
 */
export function Navbar() {
  const menu = useMainMenuController();
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks: MainMenuLink[] = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.howWeWork"), href: "/como-trabajamos" },
    { label: t("nav.case"), href: "/#caso" },
    { label: t("nav.price"), href: "/#precio" },
    { label: t("nav.contact"), href: "/contacto" },
  ];

  // Close when the route changes - but not on the first run, which is mount.
  // Closing an already-closed menu is not free: it starts the grace period
  // that stops hover reopening it, so the menu could not be opened by hover
  // for the first half second after every page load.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    menu.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-[10px] sm:px-8 lg:px-12">
          <Link
            to="/"
            aria-label={t("nav.homeAria")}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex min-h-[44px] w-fit items-center text-[clamp(19px,5vw,22px)] font-bold tracking-[-0.02em] text-foreground transition-opacity duration-150 ease-out hover:opacity-70 active:opacity-60 active:duration-[70ms] motion-reduce:transition-none"
          >
            Simplia<span className="text-brand">Spain</span>
            <span aria-hidden="true" className="mt-[9px] self-start text-[11px] font-semibold text-brand">
              ®
            </span>
          </Link>

          <button
            type="button"
            {...menu.triggerProps}
            aria-label={menu.isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            className="-mr-3 flex h-12 w-12 items-center justify-center rounded-md text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-secondary active:scale-90 active:duration-[70ms] motion-reduce:transition-[background-color] motion-reduce:active:scale-100"
          >
            {/* Always the closed shape: by the time the menu is open the
                panel covers this, and its own glyph animates into the cross. */}
            <MenuGlyph open={false} />
          </button>
        </div>
      </header>

      <MainMenu controller={menu} navLinks={navLinks} />
    </>
  );
}
