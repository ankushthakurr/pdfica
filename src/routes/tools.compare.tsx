import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { comparePdfs, type DiffLine } from "@/lib/pdf-tools";
import { UploadCloud, Loader2, AlertTriangle, FileText } from "lucide-react";

function FileSlot({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-surface p-6 text-center hover:border-primary transition-colors">
      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {file ? (
        <div className="flex items-center gap-2 justify-center text-sm">
          <FileText className="h-4 w-4 text-primary" /><span className="truncate">{file.name}</span>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-sm font-medium">{label}</p>
        </>
      )}
    </label>
  );
}

function Page() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffLine[] | null>(null);

  const run = async () => {
    if (!a || !b) return setError("Choose two PDFs to compare.");
    setBusy(true); setError(null); setDiff(null);
    try { setDiff(await comparePdfs(a, b)); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  const adds = diff?.filter((d) => d.type === "add").length ?? 0;
  const dels = diff?.filter((d) => d.type === "del").length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Compare PDF</h1>
        <p className="mt-3 text-muted-foreground">Diff the text content of two PDFs side by side.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FileSlot label="Original PDF" file={a} onChange={setA} />
        <FileSlot label="Updated PDF" file={b} onChange={setB} />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button disabled={busy || !a || !b} onClick={run}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Comparing..." : "Compare"}
        </button>
      </div>

      {diff && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border bg-surface overflow-hidden">
          <div className="flex items-center gap-4 border-b px-4 py-3 text-sm">
            <span className="text-success">+{adds} added</span>
            <span className="text-destructive">−{dels} removed</span>
          </div>
          <pre className="max-h-[60vh] overflow-auto p-4 font-mono text-xs leading-6">
            {diff.map((d, i) => (
              <div key={i} className={
                d.type === "add" ? "bg-success/10 text-success" :
                d.type === "del" ? "bg-destructive/10 text-destructive line-through" :
                "text-muted-foreground"
              }>
                {d.type === "add" ? "+ " : d.type === "del" ? "− " : "  "}{d.text || " "}
              </div>
            ))}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/tools/compare")({
  head: () => ({ meta: [{ title: "Compare PDFs — Free | Pdfica" }, { name: "description", content: "Diff the text content of two PDFs in your browser." }] }),
  component: Page,
});
