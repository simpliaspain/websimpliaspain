import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Seo } from "@/components/Seo";
import { DemoLink } from "@/components/DemoLinks";
import { Photo } from "@/components/Photo";
import { PRIMARY, OUTLINE } from "@/lib/button-styles";
import { EMAIL, FORM_LEAD_WEBHOOK_URL, PHONE_ALT, PHONE_MAIN, demoUrl } from "@/lib/site";

// Validation schema. The phone is optional (fewer fields, more submissions);
// if given it must look like a phone number.
const contactSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  apellidos: z.string().trim().min(2, "Los apellidos son obligatorios").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().email("Email no válido").max(255, "Máximo 255 caracteres"),
  telefono: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres")
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 9, "Teléfono no válido"),
  sedes: z.string().optional(),
  informacion: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SITES_OPTIONS = ["contact.sites1", "contact.sites2", "contact.sites3", "contact.sites4"];

/**
 * The n8n "Formulario Web" flow stores exactly five fields (nombre,
 * apellidos, correo, telefono, informacion_adicional), so the number of
 * locations travels inside the message text instead of as a new field the
 * flow would silently drop.
 */
function composeMessage(sedes: string | undefined, informacion: string | undefined): string {
  const parts = [];
  if (sedes) parts.push(`Sedes: ${sedes}`);
  if (informacion) parts.push(informacion);
  return parts.join("\n");
}

/**
 * Client-side spam protection. No third-party challenge (cookies,
 * fingerprinting, consent banner); everything here is local and silent - a
 * submission judged automated gets the normal success state and is simply
 * not posted, so a bot never learns what tripped it. It does nothing against
 * a bot that posts to the webhook URL directly; that is the webhook's job.
 *
 *  - Honeypot: a "website" field humans never see or tab into.
 *  - Time to submit: under MIN_SUBMIT_MS after the form became interactive.
 *    3 s is well under the time a person needs to read five fields and click,
 *    even with browser autofill, and far above what scripts take.
 *  - Rate limit: after a submission, further ones from the same session are
 *    dropped for RATE_LIMIT_MS (sessionStorage; if storage is unavailable the
 *    check is skipped and the submission goes through).
 */
const MIN_SUBMIT_MS = 3000;
const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_KEY = "contact:lastSubmitAt";

function readLastSubmit(): number | null {
  try {
    const v = sessionStorage.getItem(RATE_LIMIT_KEY);
    return v ? Number(v) : null;
  } catch {
    return null; // storage unavailable: no rate limit, never block a real user
  }
}

function recordSubmit(): void {
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export default function Contacto() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    sedes: "",
    informacion: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot; never sent
  const readyAt = useRef<number | null>(null);
  const { toast } = useToast();

  // The page is prerendered; the form becomes interactive at hydration, which
  // is when the submit clock starts.
  useEffect(() => {
    readyAt.current = Date.now();
  }, []);

  // /contacto?interes=voz comes from the phone agent's waiting-list buttons:
  // start the message for them. Read after hydration so the prerendered page
  // and the first client render match.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("interes") === "voz") {
      setFormData((prev) => (prev.informacion ? prev : { ...prev, informacion: t("contact.voiceInterest") }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const looksAutomated = (): boolean => {
    if (website.trim() !== "") return true;
    if (readyAt.current !== null && Date.now() - readyAt.current < MIN_SUBMIT_MS) return true;
    const last = readLastSubmit();
    if (last !== null && Date.now() - last < RATE_LIMIT_MS) return true;
    return false;
  };

  const showSuccess = () => {
    setIsSubmitted(true);
    toast({
      title: "¡Mensaje enviado!",
      description: "Nos pondremos en contacto contigo pronto.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Silent drop: same success state, nothing posted.
    if (looksAutomated()) {
      recordSubmit();
      showSuccess();
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to webhook with JSON body
      const response = await fetch(FORM_LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          correo: formData.email,
          telefono: formData.telefono,
          informacion_adicional: composeMessage(formData.sedes, formData.informacion),
        }),
      });

      const data = await response.json();

      if (data.success === true) {
        recordSubmit();
        showSuccess();
      } else {
        throw new Error("El servidor no confirmó el envío");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Seo titleKey="seo.contact.title" descriptionKey="seo.contact.description" path="/contacto" />
        <Navbar />
        <main>
          <section className="pb-[clamp(56px,8vw,120px)] pt-[clamp(40px,7vw,96px)]">
            <div className="wrap grid max-w-[780px] gap-6">
              <h1 className="m-0 text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] text-foreground">
                {t("contact.thankYou")}
              </h1>
              <p className="m-0 max-w-[620px] text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
                {t("contact.confirmation")}
              </p>
              <div className="flex flex-wrap gap-3">
                <DemoLink lugar="contacto" />
                <a href="/" className={OUTLINE}>
                  {t("contact.backHome")}
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // One shape for every control: the buttons' 8px corner, 48px tall, and the
  // page's own hairline rather than shadcn's default input border.
  const FIELD = "h-12 rounded-md border-border bg-background text-base";
  const LABEL = "text-[15px] font-semibold text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.contact.title" descriptionKey="seo.contact.description" path="/contacto" />
      <Navbar />
      <main>
        {/* No entrance fade anywhere on the page: it is prerendered and this
            block holds the LCP text, which used to sit at opacity 0 until
            hydration (LCP ~2.4s). */}
        <section className="pb-[clamp(24px,3vw,48px)] pt-[clamp(40px,7vw,96px)]">
          <div className="wrap grid gap-[clamp(18px,2vw,26px)]">
            <h1 className="m-0 max-w-[900px] text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] text-foreground">
              {t('contact.title1')} <span className="text-brand">{t('contact.title2')}</span>
            </h1>
            <p className="m-0 max-w-[620px] text-pretty text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
              {t('contact.subtitle')}{' '}
              {t('contact.subtitleDemo')}{' '}
              <a
                href={demoUrl("web")}
                target="_blank"
                rel="noopener"
                className="sp-underline text-link"
                data-umami-event="demo"
                data-umami-event-lugar="contacto"
              >
                {t('contact.subtitleDemoLink')}
                <span className="sr-only"> {t('nav.opensNewTab')}</span>
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-border py-[clamp(40px,6vw,80px)]">
          <div className="wrap grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="relative grid gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className={LABEL}>{t('contact.firstName')} {t('contact.required')}</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder={t('contact.firstNamePlaceholder')}
                  className={cn(FIELD, errors.nombre && "border-destructive")}
                />
                {errors.nombre && (
                  <p className="text-xs text-destructive">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apellidos" className={LABEL}>{t('contact.lastName')} {t('contact.required')}</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder={t('contact.lastNamePlaceholder')}
                  className={cn(FIELD, errors.apellidos && "border-destructive")}
                />
                {errors.apellidos && (
                  <p className="text-xs text-destructive">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={LABEL}>{t('contact.email')} {t('contact.required')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact.emailPlaceholder')}
                className={cn(FIELD, errors.email && "border-destructive")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className={LABEL}>
                {t('contact.phone')} <span className="font-normal text-muted-foreground">{t('contact.optional')}</span>
              </Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder={t('contact.phonePlaceholder')}
                className={cn(FIELD, errors.telefono && "border-destructive")}
              />
              {errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sedes" className={LABEL}>
                {t('contact.sites')} <span className="font-normal text-muted-foreground">{t('contact.optional')}</span>
              </Label>
              {/* Native select: keyboard, screen readers and the phone's own
                  picker for free. Styled to match <Input>. */}
              <select
                id="sedes"
                name="sedes"
                value={formData.sedes}
                onChange={handleChange}
                className={cn(FIELD, "flex w-full border px-3 py-2")}
              >
                <option value="">{t('contact.sitesPlaceholder')}</option>
                {SITES_OPTIONS.map((key) => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="informacion" className={LABEL}>{t('contact.message')}</Label>
              <Textarea
                id="informacion"
                name="informacion"
                value={formData.informacion}
                onChange={handleChange}
                placeholder={t('contact.messagePlaceholder')}
                rows={3}
                className={cn("rounded-md border-border bg-background text-base", errors.informacion && "border-destructive")}
              />
            </div>

            {/* Honeypot. Positioned off-screen rather than display:none so
                naive bots still "see" it; aria-hidden + tabindex=-1 keep it
                out of assistive tech and the tab order; autocomplete off keeps
                browsers from filling it for real users. */}
            <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="website">{t('contact.websiteField')}</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="mt-1 flex">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${PRIMARY} w-full disabled:opacity-60 sm:w-auto`}
                data-umami-event="formulario"
              >
                {t('contact.send')}
              </button>
            </div>

            <p className="m-0 text-sm text-muted-foreground">
              {t('contact.privacyNote')}{' '}
              <a href="/politica-privacidad" className="sp-underline text-link">
                {t('contact.privacyPolicy')}
              </a>
              .
            </p>
          </form>

          {/* The alternatives to the form, on their own rules. This is the
              only page that shows both phone numbers. */}
          <div className="grid content-start gap-7">
            <div className="grid gap-1.5">
              <p className="m-0 text-[15px] font-semibold text-muted-foreground">
                {t('contact.callTitle')}
              </p>
              <a
                href={PHONE_MAIN.href}
                className="sp-link inline-flex min-h-[44px] w-fit items-center text-[clamp(22px,2.2vw,28px)] font-bold tracking-[-0.02em] text-foreground hover:text-link"
              >
                {PHONE_MAIN.display}
              </a>
              <p className="m-0 text-sm text-muted-foreground">
                {t('footer.altPhone')}:{' '}
                <a href={PHONE_ALT.href} className="sp-underline hover:text-foreground">
                  {PHONE_ALT.display}
                </a>
              </p>
            </div>

            <div className="grid gap-1.5 border-t border-border pt-5">
              <p className="m-0 text-[15px] font-semibold text-muted-foreground">
                {t('contact.emailTitle')}
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="sp-link inline-flex min-h-[44px] w-fit items-center text-[17px] font-semibold text-foreground hover:text-link"
              >
                {EMAIL}
              </a>
            </div>

            {/* Who answers. The column ran out of content well before the
                form did, and on a page that asks for someone's name and
                telephone number the two faces on the other end are worth
                more than the white space they fill. */}
            {/* A cyanotype. The two founders are the one photograph on the
                site of the people who answer, and printed in iron blue it
                stops being a snapshot and becomes of a piece with
                everything around it - the blue is the page's, the paper is
                the page's white.

                It does not come up to full colour under the pointer any
                more. A photograph is not a control, and a picture that
                changes when you reach for it reads as something you can
                press. The print is the finished state. See .cianotipia in
                src/index.css for how the duotone is built. */}
            <figure className="m-0 grid gap-2.5">
              <span className="cianotipia block overflow-hidden rounded-[18px] bg-secondary">
                <Photo
                  name="equipo"
                  alt={t('contact.teamAlt')}
                  width={1279}
                  height={683}
                  sizes="(min-width: 1024px) 400px, 100vw"
                />
                {/* The merest edge, so the picture does not float free of the
                    hairlines above it. */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-foreground/[0.08]" />
              </span>
              <figcaption className="text-[15px] text-muted-foreground">{t('contact.teamCaption')}</figcaption>
            </figure>
          </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
