import { motion } from "framer-motion";
import { ReactNode } from "react";

export function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <motion.div 
      className="text-center py-12 px-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground/60">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-[260px] mx-auto">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export function StatItem({
  icon: Icon,
  value,
  label,
  color = "text-primary",
}: {
  icon: any;
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center mb-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <motion.span 
        className="text-xl font-extrabold text-foreground"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.span>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
