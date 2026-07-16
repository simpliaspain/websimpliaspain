import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navbar
    'nav.home': 'Inicio',
    'nav.method': 'Método',
    'nav.services': 'Servicios',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contacto',
    'nav.menu': 'Menu',
    'nav.ourServices': 'Nuestros Servicios',
    'nav.navigation': 'Navegación',
    'nav.readyToStart': '¿Listo para empezar?',
    'nav.strategyCall': 'Agenda una llamada de estrategia gratuita de 15 minutos',
    
    // Services
    'service.chatbots': 'Chatbots Multicanal',
    'service.chatbotsDesc': 'WhatsApp, Instagram, Telegram y Web',
    'service.agents': 'Agentes Telefónicos IA',
    'service.agentsDesc': 'Atiende llamadas 24/7 con IA',
    
    // Hero
    'hero.wantMore': '¿Quieres Más',
    'hero.clients': 'Clientes?',
    'hero.subtitle1': 'Impulsa tu negocio con',
    'hero.subtitle2': 'Sistemas de Atención al Cliente',
    'hero.subtitle3': 'con',
    'hero.subtitle4': 'Chatbots e Inteligencia Artificial',
    'hero.collaborating': 'Colaborando con las mejores empresas',
    'hero.available': 'DISPONIBLE',
    'hero.strategyCall': 'Llamada de Estrategia (15 mins)',
    
    // CTA Section
    'cta.startNow': 'Comienza ahora',
    'cta.readyTo': '¿Listo para',
    'cta.automate': 'automatizar',
    'cta.scheduleDesc': 'Agenda una consulta gratuita de 15 minutos y descubre cómo la IA puede impulsar tu crecimiento',
    'cta.requestFreeConsult': 'Solicitar Consulta Gratis',
    'cta.noCommitment': 'Sin compromiso • Respuesta en menos de 24h',
    
    // CTA Buttons
    'cta.contact': 'Contactar',
    'cta.schedule': 'Agenda tu Reunión',
    'cta.listenDemo': 'Escuchar Demo',
    'cta.watchDemo': 'Ver Demo en Vivo',
    'cta.requestDemo': 'Solicitar Demo Gratis',
    
    // Method Section
    'method.badge': 'Nuestro Método',
    'method.title1': 'De Lead a Cliente',
    'method.title2': 'Automatizado',
    'method.title3': 'en 3 pasos',
    'method.step1': 'Paso 1',
    'method.step1Title': 'Genera Leads',
    'method.step1Desc': 'Generamos leads cualificados para tu negocio mediante chatbots inteligentes y automatizaciones multicanal.',
    'method.step1Badge1': 'Lead Scoring',
    'method.step1Badge2': 'Cualificación Automática',
    'method.step2': 'Paso 2',
    'method.step2Title': 'Atiende a los Clientes',
    'method.step2Desc': 'Proporcionamos los chatbots y automatizaciones que atienden a tus clientes 24/7 en todos los canales.',
    'method.step2Badge1': '24/7 Disponible',
    'method.step2Badge2': 'Multicanal',
    'method.step3': 'Paso 3',
    'method.step3Title': 'Convierte',
    'method.step3Desc': 'Proporcionamos leads cualificados y listos para pagar. Nuestros sistemas los calientan hasta que están preparados para comprar.',
    'method.step3Badge1': 'Alta Conversión',
    'method.step3Badge2': 'ROI Garantizado',
    
    // Benefits Section
    'benefits.badge': 'Beneficios',
    'benefits.title': 'Por qué somos únicos...',
    'benefits.others': 'Otras agencias',
    'benefits.other1': 'Chatbots básicos sin IA real',
    'benefits.other2': 'Configuraciones genéricas que no entienden tu negocio',
    'benefits.other3': 'Sin integración con tus sistemas actuales',
    'benefits.other4': 'Soporte técnico lento o inexistente',
    'benefits.other5': 'Costes ocultos y tarifas variables',
    'benefits.other6': 'Sin métricas ni análisis de rendimiento',
    'benefits.our1': 'IA conversacional que aprende de tu negocio',
    'benefits.our2': 'En colaboración con +50 empresas',
    'benefits.our3': 'Integración completa con CRM, WhatsApp y web',
    'benefits.our4': 'Soporte técnico 24/7 en español',
    'benefits.our5': 'Precio fijo sin sorpresas',
    'benefits.our6': 'Dashboard con métricas en tiempo real',
    'benefits.scheduleCall': 'Agenda tu llamada',
    
    // Services Section
    'services.badge': 'Servicios Principales',
    'services.title1': 'Soluciones de IA',
    'services.title2': 'Para Tu Negocio',
    'services.chatbotsTitle': 'Chatbots Multicanal',
    'services.chatbotsDesc': 'Automatiza tu atención en WhatsApp, Web, Instagram y Telegram con IA conversacional disponible 24/7. Captura leads, resuelve dudas y agenda citas automáticamente.',
    'services.agentsTitle': 'Agentes Telefónicos IA',
    'services.agentsDesc': 'Nunca pierdas una llamada. Agentes virtuales que atienden, registran información, agenda citas y transfieren a agentes humanos cuando es necesario.',
    'services.popular': 'Popular',
    'services.watchDemo': 'Ver Demo en Acción',
    'services.listenDemo': 'Escuchar Demo',
    'services.learnMore': 'Saber Más',
    'services.demoAuto': 'Esta es una demostración automatizada',
    
    // FAQ Section
    'faq.badge': 'FAQ',
    'faq.title': 'Preguntas Frecuentes',
    'faq.q1': '¿Qué tipos de chatbots ofrecéis?',
    'faq.a1': 'Ofrecemos chatbots para WhatsApp, Telegram, Web e Instagram. Cada uno está personalizado para tu negocio y puede manejar consultas, capturar leads y derivar a agentes humanos cuando sea necesario.',
    'faq.q2': '¿Cómo funciona el agente telefónico IA?',
    'faq.a2': 'Nuestro agente telefónico IA atiende llamadas automáticamente, entiende el lenguaje natural, registra información del cliente, agenda citas y puede transferir a un agente humano si la situación lo requiere.',
    'faq.q3': '¿Cuánto tiempo tarda la implementación?',
    'faq.a3': 'La implementación típica desde 7 días hábiles, depende de la complejidad y personalización requerida.',
    'faq.q4': '¿Necesito conocimientos técnicos?',
    'faq.a4': 'No, nos encargamos de toda la configuración técnica. Tú solo necesitas decirnos cómo quieres que funcione tu asistente y nosotros lo hacemos realidad.',
    'faq.q5': '¿Qué pasa si el bot no puede resolver una consulta?',
    'faq.a5': 'El bot está configurado para reconocer sus límites y derivar automáticamente a un agente humano cuando detecta consultas complejas o cuando el cliente lo solicita.',
    'faq.q6': '¿Ofrecéis período de prueba?',
    'faq.a6': 'Sí, ofrecemos una demo gratuita donde podrás ver cómo funcionaría el sistema con tu negocio antes de tomar cualquier decisión.',
    
    // Footer
    'footer.description': 'Democratizando la IA para empresas de todos los tamaños. Chatbots inteligentes y agentes telefónicos IA para automatizar tu atención al cliente.',
    'footer.services': 'Servicios',
    'footer.chatbotsWhatsapp': 'Chatbots WhatsApp',
    'footer.chatbotsTelegram': 'Chatbots Telegram',
    'footer.chatbotsWeb': 'Chatbots Web',
    'footer.phoneAgents': 'Agentes Telefónicos',
    'footer.resources': 'Recursos',
    'footer.requestDemo': 'Solicitar Demo',
    'footer.privacyPolicy': 'Política de Privacidad',
    'footer.contactTitle': 'Contacto',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.hereToHelp': 'Estamos aquí para ayudarte 24/7',
    'footer.chatWithBot': 'Chatear con Simplia Bot',
    
    // Chatbot
    'chatbot.greeting': '¡Hola! 👋 Soy el asistente virtual de Simplia Spain.\n¿En qué puedo ayudarte hoy?',
    'chatbot.placeholder': 'Escribe tu mensaje...',
    'chatbot.online': 'Online',
    'chatbot.errorProcess': 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.',
    'chatbot.errorConnect': 'Lo siento, no pude conectar con el servidor. Por favor, inténtalo más tarde.',
    'chatbot.errorDefault': 'Lo siento, no pude procesar tu mensaje.',
    
    // Contact Page
    'contact.title1': 'Hablemos de tu',
    'contact.title2': 'proyecto',
    'contact.subtitle': 'Completa el formulario y te contactaremos en menos de 24h.',
    'contact.firstName': 'Nombre',
    'contact.lastName': 'Apellidos',
    'contact.email': 'Email',
    'contact.phone': 'Teléfono',
    'contact.message': 'Mensaje (opcional)',
    'contact.messagePlaceholder': 'Cuéntanos sobre tu negocio...',
    'contact.send': 'Enviar solicitud',
    'contact.privacyNote': 'Al enviar, aceptas nuestra',
    'contact.privacyPolicy': 'política de privacidad',
    'contact.thankYou': '¡Gracias por contactarnos!',
    'contact.confirmation': 'Hemos recibido tu información. Un miembro de nuestro equipo se pondrá en contacto contigo en menos de 24 horas.',
    'contact.backHome': 'Volver al inicio',
    'contact.required': '*',
    'contact.firstNamePlaceholder': 'Tu nombre',
    'contact.lastNamePlaceholder': 'Tus apellidos',
    'contact.emailPlaceholder': 'tu@empresa.com',
    'contact.phonePlaceholder': '+34 600 000 000',
    
    // Demo Dialog
    'demo.automated': 'Esta es una demostración automatizada',
    'demo.liveTranscription': 'Transcripción en vivo',
    'demo.callInProgress': 'Llamada en curso',
    'demo.playingRealAudio': 'Reproduciendo audio real...',
    'demo.agent': 'Agente Simplia',
    'demo.client': 'Cliente',
    'demo.online': 'En línea',
    
    // Benefits section (pages)
    'benefits.sectionBadge': 'Beneficios',
    'agents.benefitsSectionTitle': 'Ventajas del',
    'agents.benefitsSectionTitle2': 'Agente Telefónico IA',
    'agents.benefitsSectionDesc': 'Nuestros agentes telefónicos están diseñados para maximizar la eficiencia de tu negocio mientras proporcionan una experiencia excepcional a tus clientes.',
    'agents.demoListen': 'Escucha una demo y descubre cómo podemos ayudarte',
    
    // AI Phone Agents Page
    'agents.badge': 'Agentes Telefónicos IA',
    'agents.heroTitle1': 'Nunca pierdas una',
    'agents.heroTitle2': 'llamada',
    'agents.heroTitle3': 'importante',
    'agents.heroDesc': 'Agentes virtuales con IA que atienden tus llamadas 24/7, capturan información, agendan citas y transfieren cuando es necesario.',
    'agents.schedule': 'Agenda tu Reunión',
    'agents.listenDemo': 'Escuchar Demo',
    'agents.excellentRating': 'Valoración Excelente',
    'agents.featuresBadge': 'Tecnología de Voz',
    'agents.featuresTitle1': 'Capacidades del',
    'agents.featuresTitle2': 'Agente Telefónico',
    'agents.featuresSubtitle': 'Tecnología de voz avanzada que entiende el contexto y responde de forma natural.',
    'agents.feature1Title': 'Voz Natural con IA',
    'agents.feature1Desc': 'Agentes con voces realistas que entienden el contexto y responden de forma conversacional.',
    'agents.feature2Title': 'Agenda Automática',
    'agents.feature2Desc': 'Programa citas directamente en tu calendario sin intervención humana.',
    'agents.feature3Title': 'Transcripciones',
    'agents.feature3Desc': 'Todas las llamadas quedan registradas con transcripciones automáticas.',
    'agents.feature4Title': 'Transferencia Inteligente',
    'agents.feature4Desc': 'Deriva a agentes humanos cuando la situación lo requiere.',
    'agents.useCasesBadge': 'Aplicaciones',
    'agents.useCasesTitle': 'Casos de Uso',
    'agents.useCasesSubtitle': 'Adaptamos nuestros agentes telefónicos a las necesidades específicas de tu sector.',
    'agents.useCase1Title': 'Alquiler de Oficinas',
    'agents.useCase1Desc': 'Atiende consultas sobre disponibilidad, precios y características de oficinas. Agenda visitas automáticamente.',
    'agents.useCase2Title': 'Espacios de Trabajo Flexible',
    'agents.useCase2Desc': 'Gestiona reservas, explica modalidades de contratación y captura leads interesados en espacios flexibles.',
    'agents.useCase3Title': 'Coworking y Centros de Negocio',
    'agents.useCase3Desc': 'Informa sobre servicios incluidos, horarios y precios. Agenda tours guiados por las instalaciones.',
    'agents.benefit1': 'Atiende llamadas 24/7',
    'agents.benefit2': 'Sin tiempos de espera',
    'agents.benefit3': 'Captura información del cliente',
    'agents.benefit4': 'Agenda citas automáticamente',
    'agents.benefit5': 'Integración con tu CRM',
    'agents.benefit6': 'Reportes detallados',
    'agents.benefitsTitle1': 'Todo lo que necesitas para',
    'agents.benefitsTitle2': 'automatizar',
    'agents.benefitsTitle3': 'tus llamadas',
    'agents.benefitsDesc': 'Nuestros agentes telefónicos IA están diseñados para atender, cualificar y convertir llamadas en oportunidades de negocio.',
    'agents.readyCard': '¿Listo para empezar?',
    'agents.readyCardDesc': 'Agenda una demo gratuita y escucha cómo suena tu agente',
    
    // Chatbots Multichannel Page
    'chatbots.badge': 'Chatbots Multicanal',
    'chatbots.heroTitle1': 'Atiende a tus clientes en',
    'chatbots.heroTitle2': 'todos los canales',
    'chatbots.heroDesc': 'Un solo chatbot con IA que opera en WhatsApp, Instagram, Telegram y tu web. Captura leads, resuelve dudas y agenda citas automáticamente.',
    'chatbots.schedule': 'Agenda tu Reunión',
    'chatbots.watchDemo': 'Ver Demo en Vivo',
    'chatbots.excellentRating': 'Valoración Excelente',
    'chatbots.featuresBadge': 'Omnicanalidad',
    'chatbots.featuresTitle1': 'Un Bot,',
    'chatbots.featuresTitle2': 'Múltiples Canales',
    'chatbots.featuresSubtitle': 'Centraliza todas tus conversaciones en una sola plataforma con IA que aprende de tu negocio.',
    'chatbots.feature1Title': 'WhatsApp Business',
    'chatbots.feature1Desc': 'Automatiza conversaciones en WhatsApp con IA que entiende el contexto y responde de forma natural.',
    'chatbots.feature2Title': 'Instagram DMs',
    'chatbots.feature2Desc': 'Responde automáticamente a mensajes directos y comentarios, capturando leads 24/7.',
    'chatbots.feature3Title': 'Telegram Bot',
    'chatbots.feature3Desc': 'Bots inteligentes para Telegram que gestionan consultas y automatizan procesos.',
    'chatbots.feature4Title': 'Widget Web',
    'chatbots.feature4Desc': 'Chat embebido en tu web que convierte visitantes en clientes con IA conversacional.',
    'chatbots.benefitsTitle1': 'Todo lo que necesitas para',
    'chatbots.benefitsTitle2': 'automatizar',
    'chatbots.benefitsTitle3': 'tu atención',
    'chatbots.benefitsDesc': 'Nuestros chatbots multicanal están diseñados para capturar leads, cualificarlos y convertirlos en clientes mientras tú te enfocas en lo importante.',
    'chatbots.benefit1': 'Respuesta instantánea 24/7',
    'chatbots.benefit2': 'Captura de leads automática',
    'chatbots.benefit3': 'Cualificación inteligente',
    'chatbots.benefit4': 'Agenda citas sin intervención',
    'chatbots.benefit5': 'Transferencia a humanos cuando sea necesario',
    'chatbots.benefit6': 'Métricas y analytics en tiempo real',
    'chatbots.readyCard': '¿Listo para empezar?',
    'chatbots.readyCardDesc': 'Agenda una demo gratuita y descubre cómo podemos ayudarte',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.method': 'Method',
    'nav.services': 'Services',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.ourServices': 'Our Services',
    'nav.navigation': 'Navigation',
    'nav.readyToStart': 'Ready to start?',
    'nav.strategyCall': 'Schedule a free 15-minute strategy call',
    
    // Services
    'service.chatbots': 'Multichannel Chatbots',
    'service.chatbotsDesc': 'WhatsApp, Instagram, Telegram & Web',
    'service.agents': 'AI Phone Agents',
    'service.agentsDesc': 'Answer calls 24/7 with AI',
    
    // Hero
    'hero.wantMore': 'Want More',
    'hero.clients': 'Clients?',
    'hero.subtitle1': 'Boost your business with',
    'hero.subtitle2': 'Customer Service Systems',
    'hero.subtitle3': 'with',
    'hero.subtitle4': 'Chatbots and Artificial Intelligence',
    'hero.collaborating': 'Collaborating with top companies',
    'hero.available': 'AVAILABLE',
    'hero.strategyCall': 'Strategy Call (15 mins)',
    
    // CTA Section
    'cta.startNow': 'Start now',
    'cta.readyTo': 'Ready to',
    'cta.automate': 'automate',
    'cta.scheduleDesc': 'Schedule a free 15-minute consultation and discover how AI can boost your growth',
    'cta.requestFreeConsult': 'Request Free Consultation',
    'cta.noCommitment': 'No commitment • Response in less than 24h',
    
    // CTA Buttons
    'cta.contact': 'Contact',
    'cta.schedule': 'Schedule Meeting',
    'cta.listenDemo': 'Listen Demo',
    'cta.watchDemo': 'Watch Live Demo',
    'cta.requestDemo': 'Request Free Demo',
    
    // Method Section
    'method.badge': 'Our Method',
    'method.title1': 'From Lead to Client',
    'method.title2': 'Automated',
    'method.title3': 'in 3 steps',
    'method.step1': 'Step 1',
    'method.step1Title': 'Generate Leads',
    'method.step1Desc': 'We generate qualified leads for your business through intelligent chatbots and multichannel automations.',
    'method.step1Badge1': 'Lead Scoring',
    'method.step1Badge2': 'Auto Qualification',
    'method.step2': 'Step 2',
    'method.step2Title': 'Serve Customers',
    'method.step2Desc': 'We provide chatbots and automations that serve your customers 24/7 across all channels.',
    'method.step2Badge1': '24/7 Available',
    'method.step2Badge2': 'Multichannel',
    'method.step3': 'Step 3',
    'method.step3Title': 'Convert',
    'method.step3Desc': 'We deliver qualified leads ready to pay. Our systems warm them up until they\'re ready to buy.',
    'method.step3Badge1': 'High Conversion',
    'method.step3Badge2': 'Guaranteed ROI',
    
    // Benefits Section
    'benefits.badge': 'Benefits',
    'benefits.title': 'Why we are unique...',
    'benefits.others': 'Other agencies',
    'benefits.other1': 'Basic chatbots without real AI',
    'benefits.other2': 'Generic configurations that don\'t understand your business',
    'benefits.other3': 'No integration with your current systems',
    'benefits.other4': 'Slow or non-existent technical support',
    'benefits.other5': 'Hidden costs and variable rates',
    'benefits.other6': 'No metrics or performance analysis',
    'benefits.our1': 'Conversational AI that learns from your business',
    'benefits.our2': 'Collaborating with +50 companies',
    'benefits.our3': 'Full integration with CRM, WhatsApp and web',
    'benefits.our4': '24/7 technical support in Spanish',
    'benefits.our5': 'Fixed price with no surprises',
    'benefits.our6': 'Dashboard with real-time metrics',
    'benefits.scheduleCall': 'Schedule your call',
    
    // Services Section
    'services.badge': 'Main Services',
    'services.title1': 'AI Solutions',
    'services.title2': 'For Your Business',
    'services.chatbotsTitle': 'Multichannel Chatbots',
    'services.chatbotsDesc': 'Automate your support on WhatsApp, Web, Instagram and Telegram with conversational AI available 24/7. Capture leads, resolve doubts and schedule appointments automatically.',
    'services.agentsTitle': 'AI Phone Agents',
    'services.agentsDesc': 'Never miss a call. Virtual agents that answer, record information, schedule appointments and transfer to human agents when necessary.',
    'services.popular': 'Popular',
    'services.watchDemo': 'Watch Demo',
    'services.listenDemo': 'Listen Demo',
    'services.learnMore': 'Learn More',
    'services.demoAuto': 'This is an automated demonstration',
    
    // FAQ Section
    'faq.badge': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What types of chatbots do you offer?',
    'faq.a1': 'We offer chatbots for WhatsApp, Telegram, Web and Instagram. Each one is customized for your business and can handle inquiries, capture leads and transfer to human agents when necessary.',
    'faq.q2': 'How does the AI phone agent work?',
    'faq.a2': 'Our AI phone agent answers calls automatically, understands natural language, records customer information, schedules appointments and can transfer to a human agent if the situation requires it.',
    'faq.q3': 'How long does implementation take?',
    'faq.a3': 'Typical implementation takes from 7 business days, depending on the complexity and customization required.',
    'faq.q4': 'Do I need technical knowledge?',
    'faq.a4': 'No, we take care of all the technical setup. You just need to tell us how you want your assistant to work and we make it happen.',
    'faq.q5': 'What happens if the bot cannot resolve a query?',
    'faq.a5': 'The bot is configured to recognize its limits and automatically transfer to a human agent when it detects complex queries or when the customer requests it.',
    'faq.q6': 'Do you offer a trial period?',
    'faq.a6': 'Yes, we offer a free demo where you can see how the system would work with your business before making any decision.',
    
    // Footer
    'footer.description': 'Democratizing AI for businesses of all sizes. Intelligent chatbots and AI phone agents to automate your customer service.',
    'footer.services': 'Services',
    'footer.chatbotsWhatsapp': 'WhatsApp Chatbots',
    'footer.chatbotsTelegram': 'Telegram Chatbots',
    'footer.chatbotsWeb': 'Web Chatbots',
    'footer.phoneAgents': 'Phone Agents',
    'footer.resources': 'Resources',
    'footer.requestDemo': 'Request Demo',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.contactTitle': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.hereToHelp': 'We\'re here to help you 24/7',
    'footer.chatWithBot': 'Chat with Simplia Bot',
    
    // Chatbot
    'chatbot.greeting': 'Hello! 👋 I\'m the virtual assistant of Simplia Spain.\nHow can I help you today?',
    'chatbot.placeholder': 'Write your message...',
    'chatbot.online': 'Online',
    'chatbot.errorProcess': 'Sorry, there was a problem processing your message. Please try again.',
    'chatbot.errorConnect': 'Sorry, I couldn\'t connect to the server. Please try again later.',
    'chatbot.errorDefault': 'Sorry, I couldn\'t process your message.',
    
    // Contact Page
    'contact.title1': 'Let\'s talk about your',
    'contact.title2': 'project',
    'contact.subtitle': 'Fill out the form and we\'ll contact you within 24h.',
    'contact.firstName': 'First Name',
    'contact.lastName': 'Last Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message (optional)',
    'contact.messagePlaceholder': 'Tell us about your business...',
    'contact.send': 'Send request',
    'contact.privacyNote': 'By submitting, you accept our',
    'contact.privacyPolicy': 'privacy policy',
    'contact.thankYou': 'Thank you for contacting us!',
    'contact.confirmation': 'We have received your information. A team member will contact you within 24 hours.',
    'contact.backHome': 'Back to home',
    'contact.required': '*',
    'contact.firstNamePlaceholder': 'Your name',
    'contact.lastNamePlaceholder': 'Your last name',
    'contact.emailPlaceholder': 'you@company.com',
    'contact.phonePlaceholder': '+1 555 000 000',
    
    // Demo Dialog
    'demo.automated': 'This is an automated demonstration',
    'demo.liveTranscription': 'Live transcription',
    'demo.callInProgress': 'Call in progress',
    'demo.playingRealAudio': 'Playing real audio...',
    'demo.agent': 'Simplia Agent',
    'demo.client': 'Client',
    'demo.online': 'Online',
    
    // Benefits section (pages)
    'benefits.sectionBadge': 'Benefits',
    'agents.benefitsSectionTitle': 'Advantages of the',
    'agents.benefitsSectionTitle2': 'AI Phone Agent',
    'agents.benefitsSectionDesc': 'Our phone agents are designed to maximize your business efficiency while providing an exceptional customer experience.',
    'agents.demoListen': 'Listen to a demo and discover how we can help you',
    
    // AI Phone Agents Page
    'agents.badge': 'AI Phone Agents',
    'agents.heroTitle1': 'Never miss an',
    'agents.heroTitle2': 'important',
    'agents.heroTitle3': 'call',
    'agents.heroDesc': 'Virtual agents with AI that answer your calls 24/7, capture information, schedule appointments and transfer when necessary.',
    'agents.schedule': 'Schedule Meeting',
    'agents.listenDemo': 'Listen Demo',
    'agents.excellentRating': 'Excellent Rating',
    'agents.featuresBadge': 'Voice Technology',
    'agents.featuresTitle1': 'Phone Agent',
    'agents.featuresTitle2': 'Capabilities',
    'agents.featuresSubtitle': 'Advanced voice technology that understands context and responds naturally.',
    'agents.feature1Title': 'Natural AI Voice',
    'agents.feature1Desc': 'Agents with realistic voices that understand context and respond conversationally.',
    'agents.feature2Title': 'Auto Scheduling',
    'agents.feature2Desc': 'Schedule appointments directly in your calendar without human intervention.',
    'agents.feature3Title': 'Transcriptions',
    'agents.feature3Desc': 'All calls are recorded with automatic transcriptions.',
    'agents.feature4Title': 'Smart Transfer',
    'agents.feature4Desc': 'Transfer to human agents when the situation requires it.',
    'agents.useCasesBadge': 'Applications',
    'agents.useCasesTitle': 'Use Cases',
    'agents.useCasesSubtitle': 'We adapt our phone agents to the specific needs of your sector.',
    'agents.useCase1Title': 'Office Rental',
    'agents.useCase1Desc': 'Handle inquiries about availability, prices and office features. Schedule visits automatically.',
    'agents.useCase2Title': 'Flexible Workspaces',
    'agents.useCase2Desc': 'Manage reservations, explain contract modalities and capture leads interested in flexible spaces.',
    'agents.useCase3Title': 'Coworking & Business Centers',
    'agents.useCase3Desc': 'Inform about included services, schedules and prices. Schedule guided tours of facilities.',
    'agents.benefit1': 'Answer calls 24/7',
    'agents.benefit2': 'No waiting times',
    'agents.benefit3': 'Capture customer information',
    'agents.benefit4': 'Schedule appointments automatically',
    'agents.benefit5': 'CRM integration',
    'agents.benefit6': 'Detailed reports',
    'agents.benefitsTitle1': 'Everything you need to',
    'agents.benefitsTitle2': 'automate',
    'agents.benefitsTitle3': 'your calls',
    'agents.benefitsDesc': 'Our AI phone agents are designed to answer, qualify and convert calls into business opportunities.',
    'agents.readyCard': 'Ready to start?',
    'agents.readyCardDesc': 'Schedule a free demo and hear how your agent sounds',
    
    // Chatbots Multichannel Page
    'chatbots.badge': 'Multichannel Chatbots',
    'chatbots.heroTitle1': 'Serve your customers on',
    'chatbots.heroTitle2': 'all channels',
    'chatbots.heroDesc': 'A single AI chatbot that operates on WhatsApp, Instagram, Telegram and your website. Capture leads, resolve doubts and schedule appointments automatically.',
    'chatbots.schedule': 'Schedule Meeting',
    'chatbots.watchDemo': 'Watch Live Demo',
    'chatbots.excellentRating': 'Excellent Rating',
    'chatbots.featuresBadge': 'Omnichannel',
    'chatbots.featuresTitle1': 'One Bot,',
    'chatbots.featuresTitle2': 'Multiple Channels',
    'chatbots.featuresSubtitle': 'Centralize all your conversations on a single platform with AI that learns from your business.',
    'chatbots.feature1Title': 'WhatsApp Business',
    'chatbots.feature1Desc': 'Automate WhatsApp conversations with AI that understands context and responds naturally.',
    'chatbots.feature2Title': 'Instagram DMs',
    'chatbots.feature2Desc': 'Automatically respond to direct messages and comments, capturing leads 24/7.',
    'chatbots.feature3Title': 'Telegram Bot',
    'chatbots.feature3Desc': 'Intelligent bots for Telegram that manage inquiries and automate processes.',
    'chatbots.feature4Title': 'Web Widget',
    'chatbots.feature4Desc': 'Chat embedded in your website that converts visitors into customers with conversational AI.',
    'chatbots.benefitsTitle1': 'Everything you need to',
    'chatbots.benefitsTitle2': 'automate',
    'chatbots.benefitsTitle3': 'your support',
    'chatbots.benefitsDesc': 'Our multichannel chatbots are designed to capture leads, qualify them and convert them into customers while you focus on what matters.',
    'chatbots.benefit1': 'Instant response 24/7',
    'chatbots.benefit2': 'Automatic lead capture',
    'chatbots.benefit3': 'Smart qualification',
    'chatbots.benefit4': 'Schedule appointments without intervention',
    'chatbots.benefit5': 'Transfer to humans when needed',
    'chatbots.benefit6': 'Real-time metrics and analytics',
    'chatbots.readyCard': 'Ready to start?',
    'chatbots.readyCardDesc': 'Schedule a free demo and discover how we can help you',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'es' || saved === 'en') {
        setLanguage(saved);
      }
    } catch (e) {
      // localStorage not available
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}