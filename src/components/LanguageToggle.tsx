import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="relative flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border text-xs font-medium transition-all hover:border-primary/30 group"
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <motion.span
        initial={false}
        animate={{
          opacity: language === 'es' ? 1 : 0.5,
          scale: language === 'es' ? 1 : 0.9,
        }}
        className={`transition-colors ${language === 'es' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        ES
      </motion.span>
      <span className="text-muted-foreground/50">/</span>
      <motion.span
        initial={false}
        animate={{
          opacity: language === 'en' ? 1 : 0.5,
          scale: language === 'en' ? 1 : 0.9,
        }}
        className={`transition-colors ${language === 'en' ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        EN
      </motion.span>
    </button>
  );
}
