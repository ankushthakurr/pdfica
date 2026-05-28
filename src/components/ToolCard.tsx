import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { Tool } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools";

export function ToolCard({ tool, index = 0 }: { tool: Tool; index?: number }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;
  const tone = CATEGORIES[tool.category].tone;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04 }}
    >
      <Link
        to={tool.to}
        className="group relative block h-full rounded-2xl border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
      >
        <div
          className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted ${tone} transition-transform group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h3 className="font-display text-lg font-semibold">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.tagline}</p>
        <span className="mt-4 inline-flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Open tool →
        </span>
      </Link>
    </motion.div>
  );
}
