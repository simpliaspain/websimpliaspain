import { useState } from "react";
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
  const { toast } = useToast();

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
        setIsSubmitted(true);
        toast({
          title: "¡Mensaje enviado!",
          description: "Nos pondremos en contacto contigo pronto.",
        });
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
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
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

    window.location.href = `mailto:info@simpliaspain.es?subject=${subject}&body=${body}`;
    
    toast({
      title: "¡Borrador creado!",
      description: "Se ha abierto tu cliente de correo con todos los datos. Solo pulsa enviar.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container max-w-xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)] space-y-5"
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
