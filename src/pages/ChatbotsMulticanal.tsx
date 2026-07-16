import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Play,
  ArrowRight,
  MessageCircle,
  Instagram,
  Send,
  Globe
} from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

// Chat demo messages with timing - realistic conversation flow
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

export default function ChatbotsMulticanal() {
  const { t } = useLanguage();
  const [demoOpen, setDemoOpen] = useState(false);
  const [chatVisibleMessages, setChatVisibleMessages] = useState<number>(0);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: MessageCircle,
      title: t('chatbots.feature1Title'),
      description: t('chatbots.feature1Desc'),
    },
    {
      icon: Instagram,
      title: t('chatbots.feature2Title'),
      description: t('chatbots.feature2Desc'),
    },
    {
      icon: Send,
      title: t('chatbots.feature3Title'),
      description: t('chatbots.feature3Desc'),
    },
    {
      icon: Globe,
      title: t('chatbots.feature4Title'),
      description: t('chatbots.feature4Desc'),
    },
  ];

  const benefits = [
    t('chatbots.benefit1'),
    t('chatbots.benefit2'),
    t('chatbots.benefit3'),
    t('chatbots.benefit4'),
    t('chatbots.benefit5'),
    t('chatbots.benefit6'),
  ];

  // Chat demo animation
  useEffect(() => {
    if (demoOpen) {
      setChatVisibleMessages(0);
      let messageIndex = 0;
      
      const showNextMessage = () => {
        if (messageIndex < chatMessages.length) {
          const currentMessage = chatMessages[messageIndex];
          
          setTimeout(() => {
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

  const handleSendMessage = () => {
    if (userInput.trim()) {
      setUserInput("");
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
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">{t('chatbots.badge')}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  {t('chatbots.heroTitle1')} <span className="text-italic-gradient">{t('chatbots.heroTitle2')}</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  {t('chatbots.heroDesc')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a 
                    href="https://calendly.com/simpliaspain/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Calendar className="w-5 h-5 mr-2" />
                      {t('chatbots.schedule')}
                    </Button>
                  </a>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary/30"
                    onClick={() => setDemoOpen(true)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {t('chatbots.watchDemo')}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{t('chatbots.excellentRating')}</span>
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
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Simplia Bot</p>
                      <p className="text-xs text-green-500">{t('demo.online')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Busco una oficina en Madrid centro</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-foreground">¡Hola! 👋 Tenemos oficinas en Salamanca, Chamberí y Retiro. ¿Para cuántas personas?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Somos 4 personas</p>
                      </div>
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
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('chatbots.featuresBadge')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('chatbots.featuresTitle1')} <span className="text-italic-gradient">{t('chatbots.featuresTitle2')}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('chatbots.featuresSubtitle')}
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

        {/* Benefits Section */}
        <section className="py-20 md:py-32 bg-secondary/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {t('chatbots.benefitsTitle1')} <span className="text-italic-gradient">{t('chatbots.benefitsTitle2')}</span> {t('chatbots.benefitsTitle3')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('chatbots.benefitsDesc')}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{benefit}</span>
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
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{t('chatbots.readyCard')}</h3>
                  <p className="text-muted-foreground mb-6">{t('chatbots.readyCardDesc')}</p>
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

      {/* Chatbot Demo Dialog */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
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
                  {t('demo.online')}
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
                {t('demo.automated')}
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
    </div>
  );
}
