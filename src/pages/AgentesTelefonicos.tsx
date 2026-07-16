import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Play,
  ArrowRight,
  Mic,
  FileText,
  Users,
  Clock,
  Pause,
  Volume2
} from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function AgentesTelefonicos() {
  const { t } = useLanguage();
  const [demoOpen, setDemoOpen] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const features = [
    {
      icon: Mic,
      title: t('agents.feature1Title'),
      description: t('agents.feature1Desc'),
    },
    {
      icon: Calendar,
      title: t('agents.feature2Title'),
      description: t('agents.feature2Desc'),
    },
    {
      icon: FileText,
      title: t('agents.feature3Title'),
      description: t('agents.feature3Desc'),
    },
    {
      icon: Users,
      title: t('agents.feature4Title'),
      description: t('agents.feature4Desc'),
    },
  ];

  const benefits = [
    t('agents.benefit1'),
    t('agents.benefit2'),
    t('agents.benefit3'),
    t('agents.benefit4'),
    t('agents.benefit5'),
    t('agents.benefit6'),
  ];

  const useCases = [
    {
      title: t('agents.useCase1Title'),
      description: t('agents.useCase1Desc'),
    },
    {
      title: t('agents.useCase2Title'),
      description: t('agents.useCase2Desc'),
    },
    {
      title: t('agents.useCase3Title'),
      description: t('agents.useCase3Desc'),
    },
  ];

  // Update call timer from audio currentTime
  useEffect(() => {
    if (demoOpen && isPlaying && audioRef.current) {
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

  // Reset and start phone demo
  useEffect(() => {
    if (demoOpen) {
      setCallTime(0);
      setCurrentTranscriptIndex(0);
      // Start audio after a brief moment
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.log("Audio autoplay blocked:", err);
            setIsPlaying(false);
          });
        }
      }, 300);
    } else {
      // Cleanup when closing
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col justify-center pt-32 overflow-hidden">
          
          
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-6">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">{t('agents.badge')}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  {t('agents.heroTitle1')} <span className="text-italic-gradient">{t('agents.heroTitle2')}</span> {t('agents.heroTitle3')}
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  {t('agents.heroDesc')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a 
                    href="https://calendly.com/simpliaspain/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Calendar className="w-5 h-5 mr-2" />
                      {t('agents.schedule')}
                    </Button>
                  </a>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary/30"
                    onClick={() => setDemoOpen(true)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {t('agents.listenDemo')}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{t('agents.excellentRating')}</span>
                </div>
              </motion.div>

              {/* Demo Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)]">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Phone className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t('demo.agent')}</p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          {t('demo.callInProgress')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">02:34</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-xl px-4 py-3 flex-1">
                        <p className="text-sm text-foreground">"¡Hola! Soy Laura de Oficinas YA, tu agente virtual. ¿En qué puedo ayudarte hoy?"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="bg-primary/10 rounded-xl px-4 py-3 flex-1">
                        <p className="text-sm text-foreground">"Busco una oficina para 5 personas con contrato flexible"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-xl px-4 py-3 flex-1">
                        <p className="text-sm text-foreground">"¡Perfecto! Tenemos oficinas privadas desde 800€/mes. ¿Le gustaría agendar una visita?"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 h-2 rounded-full bg-primary/20">
                      <div className="h-full w-3/4 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid - Enhanced Design */}
        <section className="py-20 md:py-32 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('agents.featuresBadge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('agents.featuresTitle1')} <span className="text-italic-gradient">{t('agents.featuresTitle2')}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('agents.featuresSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-card border-2 border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Enhanced Design */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('agents.useCasesBadge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('agents.useCasesTitle').split(' ')[0]} <span className="text-italic-gradient">{t('agents.useCasesTitle').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('agents.useCasesSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group relative bg-card border-2 border-border rounded-2xl p-8 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{useCase.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Enhanced */}
        <section className="py-20 md:py-32 bg-secondary/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t('benefits.sectionBadge')}</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  {t('agents.benefitsSectionTitle')} <span className="text-italic-gradient">{t('agents.benefitsSectionTitle2')}</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {t('agents.benefitsSectionDesc')}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-3xl p-8"
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{t('agents.readyCard')}</h3>
                  <p className="text-muted-foreground mb-6">{t('agents.demoListen')}</p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                    {t('cta.requestDemo')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* Phone Agent Demo Dialog with Real Audio */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
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
              <p className="font-bold text-white text-lg">{t('demo.agent')}</p>
              <p className="text-primary-foreground/80 text-sm flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {t('demo.callInProgress')} • {formatTime(callTime)}
              </p>
              {isPlaying && (
                <div className="flex items-center gap-1 mt-2">
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-xs text-white/80">{t('demo.playingRealAudio')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-secondary/30 max-h-[280px] overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t('demo.liveTranscription')}
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
                        <Users className="w-4 h-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className={`flex-1 rounded-xl px-4 py-3 ${
                      item.speaker === "agent" 
                        ? "bg-card border border-border" 
                        : "bg-primary/10"
                    } ${index === currentTranscriptIndex && isPlaying ? "ring-2 ring-primary/50" : ""}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.speaker === "agent" ? t('demo.agent') : t('demo.client')}
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
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
