import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export function UtilityPage({ title, description, children }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border bg-surface p-6 md:p-8 shadow-card"
      >
        {children}
      </motion.div>
    </div>
  );
}
