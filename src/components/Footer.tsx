import { Link } from "@tanstack/react-router";
import { FileText, Github, Twitter, Mail } from "lucide-react";
import { TOOLS, CATEGORIES, toolsByCategory, type ToolCategory } from "@/lib/tools";

export function Footer() {
  const grouped = toolsByCategory();
  return (
    <footer className="border-t bg-secondary text-secondary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <span className="font-display text-xl font-bold">
                pdf<span className="text-primary">ica</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-secondary-foreground/70">
              Free, fast, and private document tools. Every file is processed on your device —
              nothing is ever uploaded to a server.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Twitter" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <Link to="/contact" aria-label="Contact" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {(Object.keys(grouped) as ToolCategory[]).map((cat) => (
              <div key={cat}>
                <div className="text-xs font-bold uppercase tracking-wider text-primary/90 mb-3">
                  {CATEGORIES[cat].label}
                </div>
                <ul className="space-y-2 text-sm">
                  {grouped[cat].map((t) => (
                    <li key={t.slug}>
                      <Link to={t.to} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between text-sm text-secondary-foreground/60">
          <p>© {new Date().getFullYear()} Pdfica · pdfica.in — Built with privacy in mind.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
