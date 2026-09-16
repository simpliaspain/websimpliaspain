import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Seo } from "@/components/Seo";

// Validation schema
const contactSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  apellidos: z.string().trim().min(2, "Los apellidos son obligatorios").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().email("Email no válido").max(255, "Máximo 255 caracteres"),
  telefono: z.string().trim().min(9, "Teléfono no válido").max(20, "Máximo 20 caracteres"),
  informacion: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Webhook URL
const FORM_LEAD_WEBHOOK = "https://simpliaspain-n8n.nlhico.easypanel.host/webhook/form-lead";

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
 *  - Content: MAX_URLS_IN_MESSAGE or more distinct links in the optional
 *    message. One (the prospect's site) or two (site + LinkedIn) pass; three
 *    in a first-contact note is the classic pattern.
 *  - Rate limit: after a submission, further ones from the same session are
 *    dropped for RATE_LIMIT_MS (sessionStorage; if storage is unavailable the
 *    check is skipped and the submission goes through).
 */
const MIN_SUBMIT_MS = 3000;
const MAX_URLS_IN_MESSAGE = 3;
const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_KEY = "contact:lastSubmitAt";
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s]+/gi;

function countUrls(text: string): number {
  return new Set((text.match(URL_PATTERN) || []).map((u) => u.toLowerCase())).size;
}

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

  const looksAutomated = (): boolean => {
    if (website.trim() !== "") return true;
    if (readyAt.current !== null && Date.now() - readyAt.current < MIN_SUBMIT_MS) return true;
    if (countUrls(formData.informacion || "") >= MAX_URLS_IN_MESSAGE) return true;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch(FORM_LEAD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          correo: formData.email,
          telefono: formData.telefono,
          informacion_adicional: formData.informacion || "",
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
        <main className="pt-32 pb-20">
          <div className="container">
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {t('contact.thankYou')}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t('contact.confirmation')}
              </p>
              <Button onClick={() => window.location.href = "/"}>
                {t('contact.backHome')}
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const openMailClient = () => {
    // Validate form first
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

    // Create mailto link with all form data
    const subject = encodeURIComponent("Nuevo lead WEB - Simplia Spain");
    const body = encodeURIComponent(
`NUEVA SOLICITUD DE CONTACTO
================================

DATOS DEL CLIENTE:

• Nombre: ${formData.nombre}
• Apellidos: ${formData.apellidos}
• Email: ${formData.email}
• Teléfono: ${formData.telefono}

INFORMACIÓN ADICIONAL:
${formData.informacion || "No proporcionada"}

================================
Enviado desde: Web Simplia Spain
Fecha: ${new Date().toLocaleDateString('es-ES', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
`
    );

    window.location.href = `mailto:info@simpliaspain.com?subject=${subject}&body=${body}`;
    
    toast({
      title: "¡Borrador creado!",
      description: "Se ha abierto tu cliente de correo con todos los datos. Solo pulsa enviar.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.contact.title" descriptionKey="seo.contact.description" path="/contacto" />
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container max-w-xl mx-auto px-4">
          {/* No entrance fade: the page is prerendered and this block holds the
              LCP text, which sat at opacity 0 until hydration (LCP ~2.4s). */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('contact.title1')} <span className="text-italic-gradient">{t('contact.title2')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </motion.div>

          <motion.form
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)] space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">{t('contact.firstName')} {t('contact.required')}</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder={t('contact.firstNamePlaceholder')}
                  className={errors.nombre ? "border-destructive" : ""}
                />
                {errors.nombre && (
                  <p className="text-xs text-destructive">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apellidos">{t('contact.lastName')} {t('contact.required')}</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder={t('contact.lastNamePlaceholder')}
                  className={errors.apellidos ? "border-destructive" : ""}
                />
                {errors.apellidos && (
                  <p className="text-xs text-destructive">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('contact.email')} {t('contact.required')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact.emailPlaceholder')}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">{t('contact.phone')} {t('contact.required')}</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder={t('contact.phonePlaceholder')}
                className={errors.telefono ? "border-destructive" : ""}
              />
              {errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="informacion">{t('contact.message')}</Label>
              <Textarea
                id="informacion"
                name="informacion"
                value={formData.informacion}
                onChange={handleChange}
                placeholder={t('contact.messagePlaceholder')}
                rows={3}
                className={errors.informacion ? "border-destructive" : ""}
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

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              {t('contact.send')}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t('contact.privacyNote')} <a href="/politica-privacidad" className="text-primary hover:underline">{t('contact.privacyPolicy')}</a>.
            </p>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
