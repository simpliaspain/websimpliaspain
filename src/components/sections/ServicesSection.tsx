import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Phone, Sparkles, Play, ArrowRight, MessageCircle, Mic, User, Send, Pause, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

// Chat demo messages - office rental sector
const chatMessages = [
  { type: "bot", text: "¡Hola! 👋 Soy el asistente virtual de Espacios Pro. ¿En qué puedo ayudarte hoy?", delay: 0 },
  { type: "user", text: "Hola, busco una oficina para alquilar en Madrid centro", delay: 1800 },
  { type: "bot", text: "¡Perfecto! Tenemos oficinas disponibles en zonas premium como Salamanca, Chamberí y Retiro. ¿Para cuántas personas necesitas el espacio?", delay: 3500 },
  { type: "user", text: "Somos un equipo de 4 personas", delay: 5500 },
  { type: "bot", text: "Genial. Para equipos de 4 personas tenemos oficinas privadas desde 650€/mes, totalmente equipadas con internet de alta velocidad, sala de reuniones incluida y acceso 24/7. ¿Te gustaría agendar una visita?", delay: 7500 },
  { type: "user", text: "Sí, me interesa ver las de Salamanca", delay: 10000 },
  { type: "bot", text: "Perfecto. Para reservar tu visita necesito algunos datos. ¿Cuál es tu nombre?", delay: 11500 },
  { type: "user", text: "Soy Carlos Martínez", delay: 13500 },
  { type: "bot", text: "Gracias Carlos. ¿Y cuál es el mejor teléfono para contactarte?", delay: 15000 },
  { type: "user", text: "Mi teléfono es 654 321 987", delay: 17000 },
  { type: "bot", text: "¡Perfecto Carlos! ✅ He agendado tu visita a las oficinas de Salamanca. Un asesor te contactará al 654 321 987 para confirmar fecha y hora. ¡Gracias por confiar en Espacios Pro!", delay: 18500 },
];

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
  const [chatVisibleMessages, setChatVisibleMessages] = useState<number>(0);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const services = [
    {
      icon: MessageSquare,
      title: t('services.chatbotsTitle'),
      description: t('services.chatbotsDesc'),
      badges: ["WhatsApp", "Instagram", "Telegram", "Web"],
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      demoText: t('services.watchDemo'),
      link: "/chatbots-multicanal",
      featured: true,
      key: "Chatbots Multicanal",
    },
    {
      icon: Phone,
      title: t('services.agentsTitle'),
      description: t('services.agentsDesc'),
      badges: ["24/7", "Agenda", "Transcripciones"],
      color: "text-primary",
      bgColor: "bg-primary/10",
      demoText: t('services.listenDemo'),
      link: "/agentes-telefonicos",
      featured: true,
      key: "Agentes Telefónicos IA",
    },
  ];

  // Chat demo animation
  useEffect(() => {
    if (demoOpen === "Chatbots Multicanal") {
      setChatVisibleMessages(0);
      let messageIndex = 0;
      
      const showNextMessage = () => {
        if (messageIndex < chatMessages.length) {
          const currentMessage = chatMessages[messageIndex];
          const nextMessage = chatMessages[messageIndex + 1];
          
          setTimeout(() => {
            // Show typing indicator before bot messages
            if (currentMessage.type === "bot") {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                setChatVisibleMessages(prev => prev + 1);
                messageIndex++;
                showNextMessage();
              }, 800);
            } else {
              setChatVisibleMessages(prev => prev + 1);
              messageIndex++;
              showNextMessage();
            }
          }, messageIndex === 0 ? 500 : currentMessage.delay - (chatMessages[messageIndex - 1]?.delay || 0));
        }
      };
      
      showNextMessage();
    }
  }, [demoOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatVisibleMessages, isTyping]);

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

  // Reset phone demo
  useEffect(() => {
    if (demoOpen === "Agentes Telefónicos IA") {
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

  const handleSendMessage = () => {
    if (userInput.trim()) {
      setUserInput("");
    }
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
      <section id="servicios" className="py-24 md:py-32 relative bg-background">
        <div className="container">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{t('services.badge')}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('services.title1')} <br />
              <span className="text-italic-gradient">{t('services.title2')}</span>
            </h2>
          </motion.div>

          {/* Services Grid - 2 main services */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-card border-2 border-border rounded-3xl p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                      {t('services.popular')}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
                  <service.icon className={`w-10 h-10 ${service.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {service.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Demo & CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 group/btn border-primary/30 hover:bg-primary/10"
                    onClick={() => setDemoOpen(service.title)}
                  >
                    <Play className="w-4 h-4 mr-2 text-primary" />
                    {service.demoText}
                  </Button>
                  <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to={service.link}>
                      {t('services.learnMore')}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Demo Dialog - Interactive */}
      <Dialog open={demoOpen === "Chatbots Multicanal"} onOpenChange={() => setDemoOpen(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-green-500 to-green-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Simplia Bot</p>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  En línea
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-secondary/30 min-h-[320px] max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              <AnimatePresence>
                {chatMessages.slice(0, chatVisibleMessages).map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.type === "user" ? (
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                        <p className="text-sm text-foreground">{msg.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Professional demo footer - no input field */}
          <div className="p-4 bg-background border-t border-border">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('services.demoAuto')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  WhatsApp
                </span>
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Instagram
                </span>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Telegram
                </span>
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Web
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Agent Demo Dialog - Real Audio */}
      <Dialog open={demoOpen === "Agentes Telefónicos IA"} onOpenChange={() => setDemoOpen(null)}>
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
