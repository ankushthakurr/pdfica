import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { UploadCloud, FileText, Download, Loader2, AlertTriangle, X, Image as ImageIcon } from "lucide-react";
import { pdfToImagePages } from "@/lib/pdf-tools";
import { downloadBlob, formatBytes } from "@/lib/format";

type PageItem = { index: number; url: string; blob: Blob };
type Format = "image/png" | "image/jpeg" | "image/webp";

const EXT: Record<Format, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("image/png");
  const [quality, setQuality] = useState<"fast" | "balanced" | "hq">("balanced");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [pages, setPages] = useState<PageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    setFile(null);
    setError(null);
    setProgress({ done: 0, total: 0 });
  };

  const pick = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("Max 100 MB per file.");
      return;
    }
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    setError(null);
    setFile(f);
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    const scale = quality === "fast" ? 1 : quality === "balanced" ? 1.5 : 2.2;
    const q = quality === "hq" ? 0.95 : 0.85;
    try {
      const { blobs } = await pdfToImagePages(file, {
        scale,
        quality: q,
        format,
        concurrency: 3,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      setPages(blobs.map((b, i) => ({ index: i + 1, blob: b, url: URL.createObjectURL(b) })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  };

  const ext = EXT[format];

  const downloadAll = async () => {
    if (!pages.length || !file) return;
    if (pages.length === 1) {
      downloadBlob(pages[0].blob, file.name.replace(/\.pdf$/i, "") + "." + ext);
      return;
    }
    const zip = new JSZip();
    pages.forEach((p) => zip.file(`page-${String(p.index).padStart(3, "0")}.${ext}`, p.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + `-${ext}-images.zip`);
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">PDF to Image</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Convert every page of a PDF to a PNG, JPG or WebP image. Fast, parallel rendering — download pages individually or all as ZIP.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {!file && (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) pick(e.dataTransfer.files[0]); }}
              className="block cursor-pointer rounded-3xl border-2 border-dashed border-border bg-surface p-10 md:p-16 text-center hover:border-primary transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
              />
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Drop a PDF here</h3>
              <p className="mt-1 text-sm text-muted-foreground">Or click to browse — up to 100 MB.</p>
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
                <button onClick={reset} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {busy && (
            <div className="rounded-2xl border bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Rendering pages…</span>
                <span className="text-muted-foreground">{progress.done} / {progress.total || "?"}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-primary" animate={{ width: `${pct}%` }} transition={{ ease: "linear" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <AnimatePresence>
            {pages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{pages.length} image{pages.length > 1 ? "s" : ""} ready</p>
                  <button
                    onClick={downloadAll}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"
                  >
                    <Download className="h-3.5 w-3.5" /> Download {pages.length > 1 ? "all (ZIP)" : ext.toUpperCase()}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pages.map((p) => (
                    <motion.div
                      key={p.index}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative overflow-hidden rounded-xl border bg-background"
                    >
                      <img src={p.url} alt={`Page ${p.index}`} className="block w-full h-auto" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
                        <span>Page {p.index}</span>
                        <button
                          onClick={() => file && downloadBlob(p.blob, `${file.name.replace(/\.pdf$/i, "")}-p${p.index}.${ext}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-white"
                        >
                          <Download className="h-3 w-3" /> {ext.toUpperCase()}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!pages.length && (
            <div className="flex justify-end">
              <button
                disabled={!file || busy}
                onClick={run}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Converting…" : `Convert to ${ext.toUpperCase()}`}
              </button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-2xl border bg-surface p-5">
            <h4 className="font-display text-base font-semibold mb-3">Format</h4>
            <div className="space-y-2 text-sm">
              {(["image/png", "image/jpeg", "image/webp"] as const).map((f) => (
                <label key={f} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${format === f ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <input type="radio" name="fmt" checked={format === f} onChange={() => setFormat(f)} className="accent-primary" />
                  <span className="font-medium">{EXT[f].toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-surface p-5">
            <h4 className="font-display text-base font-semibold mb-3">Quality</h4>
            <div className="space-y-2 text-sm">
              {([
                ["fast", "Fast", "Lower resolution, fastest"],
                ["balanced", "Balanced", "Recommended"],
                ["hq", "High quality", "Largest, slower"],
              ] as const).map(([id, label, hint]) => (
                <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${quality === id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <input type="radio" name="quality" value={id} checked={quality === id} onChange={() => setQuality(id)} className="mt-0.5" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 text-sm">
            <p className="font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> 100% private</p>
            <p className="mt-1 text-muted-foreground">
              Rendering happens in your browser. No upload, no limits.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tools/pdf-to-image")({
  head: () => ({
    meta: [
      { title: "PDF to Image — PNG, JPG, WebP | Pdfica" },
      { name: "description", content: "Convert PDF pages to PNG, JPG or WebP images instantly in your browser. Per-page download or bulk ZIP. No signup, no limits." },
      { property: "og:title", content: "PDF to Image — Pdfica" },
      { property: "og:description", content: "Fast, private PDF to image conversion with parallel rendering." },
    ],
  }),
  component: Page,
});
