import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Seo } from "@/components/Seo";

// Date the policy text was last changed (ISO). Update it by hand when the
// policy changes. It used to be `new Date()`, i.e. "today" for every visitor,
// which is not an update date and would also break hydration of the
// prerendered page from the day after each build.
const POLICY_UPDATED = "2026-07-16";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo titleKey="seo.privacy.title" descriptionKey="seo.privacy.description" path="/politica-privacidad" />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          {/* No entrance fade: the page is prerendered and this block holds the
              LCP text, which sat at opacity 0 until hydration (LCP ~2.4s). */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Política de <span className="text-italic-gradient">Privacidad</span>
            </h1>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">
                Última actualización: {new Date(POLICY_UPDATED).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">1. Responsable del Tratamiento</h2>
                <p>
                  <strong>Simplia Spain</strong> es el responsable del tratamiento de los datos personales que nos proporciones a través de esta web.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email de contacto:</strong> info@simpliaspain.com</li>
                  <li><strong>Teléfono:</strong> +34 601 755 607 / +34 608 445 993</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">2. Datos que Recopilamos</h2>
                <p>Cuando interactúas con nosotros, podemos recopilar los siguientes datos personales:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de identificación:</strong> nombre, apellidos</li>
                  <li><strong>Datos de contacto:</strong> correo electrónico, número de teléfono</li>
                  <li><strong>Información adicional:</strong> cualquier información que nos proporciones voluntariamente en el formulario de contacto</li>
                  <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas (de forma anónima)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">3. Finalidad del Tratamiento</h2>
                <p>Utilizamos tus datos personales para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Responder a tus consultas y solicitudes de información</li>
                  <li>Proporcionarte información sobre nuestros servicios de chatbots y agentes telefónicos IA</li>
                  <li>Gestionar la relación comercial</li>
                  <li>Enviarte comunicaciones comerciales si nos has dado tu consentimiento</li>
                  <li>Mejorar nuestros servicios y la experiencia de usuario</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">4. Base Legal del Tratamiento</h2>
                <p>El tratamiento de tus datos se basa en:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Tu consentimiento:</strong> al rellenar el formulario de contacto</li>
                  <li><strong>Interés legítimo:</strong> para gestionar las solicitudes comerciales</li>
                  <li><strong>Ejecución de contrato:</strong> cuando existe una relación contractual</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">5. Conservación de Datos</h2>
                <p>
                  Conservaremos tus datos personales durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos 
                  y para determinar las posibles responsabilidades que pudieran derivarse de dicha finalidad.
                </p>
                <p>
                  Los datos de clientes potenciales se conservarán durante un máximo de 2 años desde la última interacción.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">6. Destinatarios de los Datos</h2>
                <p>Tus datos podrán ser comunicados a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proveedores de servicios tecnológicos (hosting, email, CRM) necesarios para la prestación de nuestros servicios</li>
                  <li>Administraciones públicas cuando sea legalmente obligatorio</li>
                </ul>
                <p>No vendemos ni compartimos tus datos con terceros para fines de marketing.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">7. Tus Derechos</h2>
                <p>Puedes ejercer los siguientes derechos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre ti</li>
                  <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
                  <li><strong>Supresión:</strong> solicitar la eliminación de tus datos</li>
                  <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos</li>
                  <li><strong>Limitación:</strong> solicitar la limitación del tratamiento</li>
                  <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
                </ul>
                <p>
                  Para ejercer estos derechos, contacta con nosotros en <a href="mailto:info@simpliaspain.com" className="text-primary hover:underline">info@simpliaspain.com</a>
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">8. Seguridad de los Datos</h2>
                <p>
                  Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales 
                  contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
                <p>
                  Este sitio web no utiliza cookies publicitarias, de seguimiento ni de
                  elaboración de perfiles.
                </p>
                <p>
                  Únicamente almacenamos en tu navegador tu preferencia de idioma, mediante
                  almacenamiento local, para que el sitio se muestre en el idioma que elijas.
                  Esta información no se transmite a ningún servidor ni permite identificarte, y
                  está exenta del deber de consentimiento conforme al artículo 22.2 de la LSSI.
                </p>
                <p>
                  Para la analítica de uso, consulta el apartado &quot;Analítica web&quot;.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">10. Analítica web</h2>
                <p>
                  Utilizamos Umami Analytics para conocer de forma agregada cómo se usa este
                  sitio: páginas visitadas, procedencia del tráfico, tipo de dispositivo y país
                  aproximado.
                </p>
                <p>
                  Umami no instala cookies ni ningún identificador persistente en tu
                  dispositivo, no recopila datos personales identificables y no rastrea tu
                  actividad en otros sitios web. Por este motivo no solicitamos consentimiento
                  para su uso, conforme al artículo 22.2 de la LSSI.
                </p>
                <p>
                  Los datos se almacenan en servidores situados en la Unión Europea y se
                  conservan de forma agregada. La base jurídica de este tratamiento es nuestro
                  interés legítimo en comprender y mejorar el funcionamiento del sitio
                  (art. 6.1.f RGPD).
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">11. Cambios en la Política</h2>
                <p>
                  Nos reservamos el derecho de modificar esta política de privacidad. Cualquier cambio será 
                  publicado en esta página con la fecha de actualización correspondiente.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">12. Contacto</h2>
                <p>
                  Si tienes alguna pregunta sobre esta política de privacidad o sobre el tratamiento de tus datos, 
                  puedes contactarnos en:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:info@simpliaspain.com" className="text-primary hover:underline">info@simpliaspain.com</a></li>
                  <li><strong>Teléfono:</strong> +34 601 755 607 / +34 608 445 993</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
