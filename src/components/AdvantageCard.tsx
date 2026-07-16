import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AdvantageCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function AdvantageCard({ title, description, icon: Icon, delay = 0 }: AdvantageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
