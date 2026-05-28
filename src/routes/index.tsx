import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Sparkles, FileText, ArrowRight } from "lucide-react";
import { TOOLS, CATEGORIES, toolsByCategory, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pdfica — Free Online PDF Tools, 100% Private" },
      {
        name: "description",
        content:
          "Merge, split, compress, convert, organize, protect and unlock PDFs free in your browser. No signup, no uploads — total privacy.",
      },
      { property: "og:title", content: "Pdfica — Free Online PDF Tools" },
      {
        property: "og:description",
        content: "Every PDF tool you need, working entirely in your browser.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});


function Home() {
  const grouped = toolsByCategory();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-tool-organize/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 md:pt-24 pb-12 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            100% browser-based · No uploads, ever
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight"
          >
            Every PDF tool you need.{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Free, forever.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            Merge, split, compress, convert, organize, protect and unlock PDFs in seconds.
            All processing happens on your device — your files never leave your browser.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/tools/merge"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"
            >
              <FileText className="h-4 w-4" /> Start with Merge
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 rounded-full border bg-surface px-7 py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Browse all tools <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Floating tool preview */}
          <div className="mt-16 grid grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {TOOLS.slice(0, 5).map((t, i) => {
              return (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  style={{ animationDelay: `${i * 0.4}s` }}
                  className="rounded-2xl border bg-surface p-4 shadow-card animate-float text-xs font-medium"
                >
                  {t.name}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools grid by category */}
      <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
        {(Object.keys(grouped) as ToolCategory[]).map((cat) => (
          <div key={cat} className="mb-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${CATEGORIES[cat].tone}`}>
                  {CATEGORIES[cat].label}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">
                  {CATEGORIES[cat].description}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {grouped[cat].map((t, i) => (
                <ToolCard key={t.slug} tool={t} index={i} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Why */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Truly private",
                copy: "Files never leave your device. No uploads, no servers, no logs.",
              },
              {
                icon: Zap,
                title: "Lightning fast",
                copy: "Processing runs locally with battle-tested libraries — no waiting in a queue.",
              },
              {
                icon: Sparkles,
                title: "Always free",
                copy: "Every tool is free, with no signup, no watermarks, and no daily limits.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/5 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-secondary-foreground/75">{f.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
