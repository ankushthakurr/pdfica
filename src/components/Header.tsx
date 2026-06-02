import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, FileText } from "lucide-react";
import { TOOLS, CATEGORIES, toolsByCategory, type ToolCategory } from "@/lib/tools";

export function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const grouped = toolsByCategory();

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
            <FileText className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            pdf<span className="text-primary">ica</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              All PDF Tools
              <ChevronDown className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-3"
                >
                  <div className="w-[min(95vw,1100px)] max-h-[78vh] overflow-y-auto rounded-2xl border bg-surface p-6 shadow-card-hover grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">
                    {(Object.keys(grouped) as ToolCategory[]).map((cat) => (
                      <div key={cat}>
                        <div className="mb-2">
                          <div className={`text-[11px] font-bold uppercase tracking-wider ${CATEGORIES[cat].tone}`}>
                            {CATEGORIES[cat].label}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{CATEGORIES[cat].description}</div>
                        </div>
                        <ul className="space-y-0.5">
                          {grouped[cat].map((t) => (
                            <li key={t.slug}>
                              <Link
                                to={t.to}
                                className="block rounded-md px-2 py-1 text-[13px] hover:bg-muted transition-colors"
                              >
                                {t.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/blog" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Blog
          </Link>
          <Link to="/contact" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/tools/merge"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            Start Free
          </Link>
        </div>

        <button
          className="md:hidden rounded-lg p-2 hover:bg-muted"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-surface"
          >
            <div className="px-4 py-4 space-y-4">
              {(Object.keys(grouped) as ToolCategory[]).map((cat) => (
                <div key={cat}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${CATEGORIES[cat].tone}`}>
                    {CATEGORIES[cat].label}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {grouped[cat].map((t) => (
                      <Link
                        key={t.slug}
                        to={t.to}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-2 py-2 text-sm hover:bg-muted"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 flex gap-2 text-sm">
                <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-muted">Blog</Link>
                <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-muted">Contact</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
