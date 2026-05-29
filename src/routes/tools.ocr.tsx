import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ocrPdfToText } from "@/lib/pdf-tools";
import { downloadBlob, formatBytes } from "@/lib/format";
import { UploadCloud, Loader2, Download, AlertTriangle, FileText } from "lucide-react";

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setError(null); setBlob(null); setProgress(0);
    try {
      const b = await ocrPdfToText(file, (p, s) => { setProgress(p); setStatus(s); });
      setBlob(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">OCR PDF</h1>
        <p className="mt-3 text-muted-foreground">Extract text from scanned PDFs entirely in your browser. Heavier than other tools — please be patient.</p>
      </div>

      {!file && (
        <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-border bg-surface p-12 text-center hover:border-primary transition-colors">
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          <UploadCloud className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-semibold">Drop a PDF or click to browse</p>
        </label>
      )}

      {file && (
        <div className="rounded-2xl border bg-surface p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setBlob(null); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
        </div>
      )}

      {busy && (
        <div className="mt-4 rounded-xl border bg-surface p-4">
          <p className="text-sm font-medium">{status}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {blob && (
          <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={() => downloadBlob(blob, (file?.name ?? "ocr").replace(/\.pdf$/i, "") + ".txt")}
            className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted">
            <Download className="h-4 w-4" /> Download text
          </motion.button>
        )}
        <button disabled={!file || busy} onClick={run}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Recognizing..." : "Run OCR"}
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tools/ocr")({
  head: () => ({ meta: [{ title: "OCR PDF — Free Online | Pdfica" }, { name: "description", content: "Run optical character recognition on a PDF in your browser — free and private." }] }),
  component: Page,
});
