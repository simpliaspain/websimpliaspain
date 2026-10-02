import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Phone, Play, ArrowRight, Mic, User, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import demoVideo from "@/assets/services/simplia-demo-1024.mp4";
import demoPoster from "@/assets/services/simplia-demo-poster-1024.webp";
import { ServiceDemoVideo } from "@/components/ServiceDemoVideo";
import { Section } from "@/components/Section";

// Phone demo transcript synced with trimmed audio (3 seconds removed from start)
const phoneTranscript = [
  { speaker: "agent", text: "Hola, soy el asistente virtual de Oficinas Ya. Tu llamada está siendo grabada por motivos de calidad. ¿En qué puedo ayudarte?", time: "0:00" },
  { speaker: "user", text: "Hola, buenas. Mira, era porque he estado viendo vuestra web y he visto que tenéis despachos para alquiler y me apetecía saber qué tenéis de disponibilidad en el barrio Salamanca.", time: "0:08" },
  { speaker: "agent", text: "Perfecto, te cuento. Sí, tenemos despachos en el barrio de Salamanca, en zonas como Velázquez, Serrano y Ortega y Gasset. ¿Te interesaría un despacho para uso puntual o buscas algo más fijo por meses?", time: "0:17" },
  { speaker: "user", text: "Estaba buscando algo para alquilar por horas y a lo mejor me cuadra Serrano.", time: "0:31" },
  { speaker: "agent", text: "Genial. En Serrano puedes alquilar un despacho por horas, desde unos 15 euros la hora para dos o tres personas. ¿Tienes ya alguna fecha o franja horaria en mente? ¿O prefieres que te organice una visita para que veas el espacio antes?", time: "0:35" },
  { speaker: "user", text: "Preferiría ir a verlo. Y también, algo que es importante para mí, ¿cuándo podría entrar el despacho? ¿Qué horario tendríais?", time: "0:51" },
  { speaker: "agent", text: "Por supuesto, te explico. El acceso a los despachos es 24-7, así que podrías entrar a cualquier hora, incluso fines de semana. La recepción tiene un horario diferente, pero para usar el despacho no hay problema. ¿Quieres que te reserve una visita en Serrano? Solo necesito tu nombre y un teléfono o correo para contactarte y concretar la cita.", time: "0:59" },
  { speaker: "user", text: "Vale, perfecto. Mi nombre es Roberto. Si le puedes decir al equipo que me mande fotos, estaría genial también.", time: "1:21" },
  { speaker: "agent", text: "Perfecto, Roberto. Tomo nota de tus datos y se lo paso al equipo para que te contacten, te enseñen el espacio y te envíen fotos. Te escribirán en menos de 24 horas. ¿Hay algo más en lo que te pueda ayudar ahora mismo?", time: "1:35" },
  { speaker: "user", text: "Yo creo que sí. Ah, bueno, me acabo de acordar. ¿Me puedes pasar con alguien del equipo para preguntarle algo en persona también?", time: "1:45" },
  { speaker: "agent", text: "Por supuesto. Te paso ahora mismo con un compañero del equipo para que puedas hablar directamente con él. Un momento, por favor.", time: "1:54" },
];

// Timestamps in seconds for each transcript message (adjusted for 3-second trim)
const transcriptTimestamps = [0, 8, 17, 31, 35, 51, 59, 81, 95, 105, 114];

export function ServicesSection() {
  const { t } = useLanguage();
  const [demoOpen, setDemoOpen] = useState<string | null>(null);
  // The button that opened the demo. The dialogs are not opened through a
  // Radix Trigger, so Radix cannot know where to send focus on close; we
  // remember it and hand it back in onCloseAutoFocus.
  const demoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusToTrigger = (event: Event) => {
    event.preventDefault();
    demoTriggerRef.current?.focus();
  };
  const [callTime, setCallTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const services = [
    {
      icon: MessageSquare,
      title: t('services.chatbotsTitle'),
      description: t('services.chatbotsDesc'),
      badges: ["WhatsApp", "Instagram", "Telegram", "Web"],
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      // No demo dialog: the video beside the card is the demo.
      demoText: null,
      // Primary next step for this card: talk to us (/contacto).
      contactText: t('services.contactCta'),
      link: "/chatbots-multicanal",
      badge: "popular" as const,
      key: "Chatbots Multicanal",
      listed: true,
      // Product demo, 1024x768 H.264 (see ServiceDemoVideo for loading and
      // playback rules). 1024 wide covers the 492px desktop box at 2x and a
      // 342px phone at 3x.
      visual: { video: demoVideo, poster: demoPoster, width: 1024, height: 768, labelKey: "services.chatbotsVideoLabel" },
    },
    {
      // Not on sale yet: kept here (and its demo dialog below) so it can be
      // relisted by flipping `listed`. The page /agentes-telefonicos stays live.
      icon: Phone,
      title: t('services.agentsTitle'),
      description: t('services.agentsDesc'),
      badges: ["24/7", "Agenda", "Transcripciones"],
      color: "text-primary",
      bgColor: "bg-primary/10",
      demoText: t('services.listenDemo'),
      contactText: null,
      link: "/agentes-telefonicos",
      // In beta: labelled as such, neutrally, rather than as a promotion.
      badge: "beta" as const,
      key: "Agentes Telefónicos IA",
      listed: false,
      visual: null,
    },
  ];
  const listedServices = services.filter((s) => s.listed);
  // Update call timer from audio currentTime
  useEffect(() => {
    if (demoOpen === "Agentes Telefónicos IA" && isPlaying && audioRef.current) {
      const interval = setInterval(() => {
        if (audioRef.current) {
          setCallTime(Math.floor(audioRef.current.currentTime));
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [demoOpen, isPlaying]);

  // Sync transcript with audio time
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      let newIndex = 0;
      for (let i = 0; i < transcriptTimestamps.length; i++) {
        if (currentTime >= transcriptTimestamps[i]) {
          newIndex = i;
        }
      }
      if (newIndex !== currentTranscriptIndex) {
        setCurrentTranscriptIndex(newIndex);
      }
    }
  }, [callTime, isPlaying, currentTranscriptIndex]);

  // Reset phone demo. No autoplay: audio with sound starts only from the
  // visible play button. Closing pauses and rewinds.
  useEffect(() => {
    if (demoOpen === "Agentes Telefónicos IA") {
      setCallTime(0);
      setCurrentTranscriptIndex(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [demoOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <Section variant="default" id="servicios" className="relative bg-background">
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('services.title1')} <br />
              <span className="text-italic-gradient">{t('services.title2')}</span>
            </h2>
          </motion.div>

          {/* Services grid. Flex-wrap rather than a 2-col grid so a single
              listed card sits centred at column width instead of orphaned in
              the left half; two cards fill the row exactly as before.

              The demo video is a sibling block at the same column width as
              the cards, before them: from lg it sits to the left of the
              (single) card, below lg it stacks on top. It is 4:3 at every
              width and never cropped - its frames carry headlines 80px and
              dashboards 111px from the edges, and the phone mockups run off
              the bottom - so the same full frame shows everywhere.

              From lg the two are equal padded siblings, and the row's default
              stretch makes them one height (the taller sets it). The row is
              74rem (1184px), not 5xl: with the frame's 32px padding that is a
              576px column and a 508px video - the widest box the 1024px encode
              still covers at 2x - and it stays inside the 1232px the Method
              grid and press row already use. At 1184+ the frame (449px) is the
              taller block, so the card's slack falls between its description
              and pills (mt-auto). The card can never shrink to the frame: at
              any narrower row its copy needs 408px.
              Side-by-side *inside* a half-width card is impossible (the copy
              column's minimum content leaves 0-131px for an image), so the
              image lives here. With two listed cards this row no longer works
              as [image][card][card] - the visual belongs to the multichannel
              service and would push the second card to a new row. */}
          <div className="flex flex-wrap justify-center gap-8 max-w-[74rem] mx-auto">
            {listedServices.map((service) => service.visual && (
              <ServiceDemoVideo
                key={`${service.key}-visual`}
                src={service.visual.video}
                poster={service.visual.poster}
                width={service.visual.width}
                height={service.visual.height}
                labelKey={service.visual.labelKey}
                className="w-full lg:w-[calc(50%-1rem)]"
              />
            ))}
            {listedServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex w-full flex-col lg:w-[calc(50%-1rem)] bg-card border-2 border-border rounded-3xl p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Corner badge: not rendered while a single service is shown
                    - "popular" relative to nothing is noise. The model keeps
                    `badge` and the i18n keys so it can return with a second
                    card: service.badge === "popular" / "beta". */}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${service.bgColor} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <service.icon className={`w-7 h-7 ${service.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4">{service.title}</h3>
                {/* max-w-lg (512px): when the card spans the full width
                    (md, 720px) the line ran to 80-91 characters. 65ch was not
                    enough (ch is the width of "0"; prose runs narrower, so it
                    still allowed 81). From lg the text column is 508px, so the
                    cap does not bind there. */}
                <p className="max-w-lg text-muted-foreground mb-5 leading-relaxed">
                  {service.description}
                </p>

                {/* Badges. mt-auto anchors the pills + buttons block to the
                    bottom of the card, so both cards' pill rows and button
                    rows land on the same lines however long the description
                    above is; the slack goes between description and pills. */}
                <div className="mt-auto flex flex-wrap gap-2 mb-6">
                  {service.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Actions. A card with a contact CTA leads with it: filled
                    primary to /contacto, "Saber Más" demoted to outline - one
                    clear next step, never two co-equal filled buttons. A card
                    with a demo dialog (the unlisted phone card) keeps its
                    demo + "Saber Más" pair. Both 44px tall; one row from sm,
                    stacked full width below. From lg, where the card is a
                    half-width column, the primary takes the remaining width
                    and "Saber Más" stays content-width (about 2.6:1 at
                    1440, 2:1 at 1024), so the row spans the card without
                    turning the secondary into a second bar. Between sm and lg
                    the card is full width and a stretched primary would be a
                    500px bar, so both stay content-width there. */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {service.contactText && (
                    <Button asChild className="h-11 w-full sm:w-auto lg:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/contacto">
                        {service.contactText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                  {service.demoText && (
                    <Button
                      variant="outline"
                      className="flex-1 group/btn border-primary/30 hover:bg-primary/10"
                      onClick={(event) => {
                        demoTriggerRef.current = event.currentTarget;
                        setDemoOpen(service.key);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2 text-primary" />
                      {service.demoText}
                    </Button>
                  )}
                  {service.contactText ? (
                    <Button asChild variant="outline" className="h-11 w-full sm:w-auto border-primary/30 hover:bg-primary/10">
                      <Link to={service.link}>
                        {t('services.learnMore')}
                        <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="h-11 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to={service.link}>
                        {t('services.learnMore')}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Phone Agent Demo Dialog - Real Audio */}
      <Dialog open={demoOpen === "Agentes Telefónicos IA"} onOpenChange={() => setDemoOpen(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden" aria-describedby={undefined} onCloseAutoFocus={returnFocusToTrigger}>
          <DialogTitle className="sr-only">{t('services.agentsTitle')} - {t('services.listenDemo')}</DialogTitle>
          {/* Hidden audio element */}
          <audio 
            ref={audioRef} 
            src="/audio/agente-demo.mp4" 
            preload="auto"
            onEnded={() => setIsPlaying(false)}
          />
          
          <div className="bg-gradient-to-b from-primary to-primary/90 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 relative">
                <Phone className="w-10 h-10 text-white" />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
                )}
              </div>
              <p className="font-bold text-white text-lg">Agente Simplia</p>
              <p className="text-primary-foreground/80 text-sm flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Llamada en curso • {formatTime(callTime)}
              </p>
              
              {/* Playing indicator */}
              {isPlaying && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20">
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-xs text-white/80">Reproduciendo audio real...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-secondary/30 max-h-[280px] overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Transcripción en vivo
            </p>
            <div className="space-y-3">
              <AnimatePresence>
                {phoneTranscript.slice(0, currentTranscriptIndex + 1).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: item.speaker === "agent" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.speaker === "agent" ? "bg-primary/10" : "bg-accent"
                    }`}>
                      {item.speaker === "agent" ? (
                        <Mic className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className={`flex-1 rounded-xl px-4 py-3 ${
                      item.speaker === "agent" 
                        ? "bg-card border border-border" 
                        : "bg-primary/10"
                    } ${index === currentTranscriptIndex && isPlaying ? "ring-2 ring-primary/50" : ""}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.speaker === "agent" ? "Agente Simplia" : "Cliente"}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-sm text-foreground">"{item.text}"</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Audio wave visualization - synced with audio */}
          <div className="px-4 py-3 bg-secondary/20 border-t border-border">
            <div className="flex items-center justify-center gap-[3px] h-8">
              {[...Array(24)].map((_, i) => {
                // Create more natural wave pattern
                const baseHeight = 4;
                const maxHeight = 24;
                return (
                  <motion.div
                    key={i}
                    className="w-[3px] bg-primary rounded-full"
                    animate={{
                      height: isPlaying 
                        ? [
                            baseHeight, 
                            baseHeight + Math.sin(i * 0.5) * 8 + Math.random() * (maxHeight - baseHeight - 8), 
                            baseHeight
                          ] 
                        : baseHeight,
                    }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.2,
                      repeat: isPlaying ? Infinity : 0,
                      repeatType: "reverse",
                      delay: i * 0.03,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Audio controls */}
          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full h-12 w-12"
                onClick={togglePlayPause}
                aria-label={isPlaying ? t('demo.pause') : t('demo.play')}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
