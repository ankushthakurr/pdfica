import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { htmlToPdf } from "@/lib/pdf-tools";
import { downloadBlob } from "@/lib/format";
import { Loader2, Download, AlertTriangle, Code } from "lucide-react";

function Page() {
  const [html, setHtml] = useState("<h1>Hello from Pdfica</h1>\n<p>Paste any HTML here.</p>");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setBlob(null);
    try {
      const b = await htmlToPdf(html);
      setBlob(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">HTML to PDF</h1>
        <p className="mt-3 text-muted-foreground">Paste raw HTML and convert it into a clean PDF.</p>
      </div>
      <div className="rounded-2xl border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" /> Your HTML
        </div>
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={14}
          className="w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        {blob && (
          <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={() => downloadBlob(blob, "document.pdf")}
            className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted">
            <Download className="h-4 w-4" /> Download PDF
          </motion.button>
        )}
        <button disabled={busy} onClick={run}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Working..." : "Convert to PDF"}
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tools/html-to-pdf")({
  head: () => ({ meta: [{ title: "HTML to PDF — Free | Pdfica" }, { name: "description", content: "Paste HTML and convert it to a downloadable PDF in your browser." }] }),
  component: Page,
});
