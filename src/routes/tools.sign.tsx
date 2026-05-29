import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { motion } from "framer-motion";
import { signPdf } from "@/lib/pdf-tools";
import { downloadBlob, formatBytes } from "@/lib/format";
import { UploadCloud, FileText, Loader2, Download, AlertTriangle, Eraser } from "lucide-react";

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "bottom-center">("bottom-right");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      c.width = c.offsetWidth * ratio;
      c.height = c.offsetHeight * ratio;
      c.getContext("2d")!.scale(ratio, ratio);
      padRef.current?.clear();
    };
    padRef.current = new SignaturePad(c, { backgroundColor: "rgba(0,0,0,0)", penColor: "#0f172a" });
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const sign = async () => {
    if (!file) return setError("Add a PDF first.");
    if (padRef.current?.isEmpty()) return setError("Draw a signature first.");
    setBusy(true); setError(null); setBlob(null);
    try {
      const dataUrl = padRef.current!.toDataURL("image/png");
      const b = await signPdf(file, dataUrl, page, position);
      setBlob(b);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Sign PDF</h1>
        <p className="mt-3 text-muted-foreground">Draw your signature and stamp it onto any page.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {!file ? (
            <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-border bg-surface p-12 text-center hover:border-primary transition-colors">
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
              <UploadCloud className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold">Drop a PDF or click to browse</p>
            </label>
          ) : (
            <div className="rounded-2xl border bg-surface p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button onClick={() => { setFile(null); setBlob(null); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
            </div>
          )}

          <div className="rounded-2xl border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Draw your signature</p>
              <button onClick={() => padRef.current?.clear()} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Eraser className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <canvas ref={canvasRef} className="block h-48 w-full rounded-lg border bg-white" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {blob && (
              <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={() => downloadBlob(blob, (file?.name ?? "doc").replace(/\.pdf$/i, "") + "-signed.pdf")}
                className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted">
                <Download className="h-4 w-4" /> Download
              </motion.button>
            )}
            <button disabled={busy || !file} onClick={sign}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Signing..." : "Sign PDF"}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-surface p-5 space-y-3 text-sm">
            <h4 className="font-display text-base font-semibold">Placement</h4>
            <label className="block"><span className="font-medium">Page #</span>
              <input type="number" min={1} value={page} onChange={(e) => setPage(+e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2" />
            </label>
            <div>
              <span className="font-medium block mb-2">Position</span>
              {(["bottom-left", "bottom-center", "bottom-right"] as const).map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer py-1">
                  <input type="radio" checked={position === p} onChange={() => setPosition(p)} className="accent-primary" />
                  <span>{p.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tools/sign")({
  head: () => ({ meta: [{ title: "Sign PDF — Free Online | Pdfica" }, { name: "description", content: "Draw a signature and place it on any PDF page — 100% private." }] }),
  component: Page,
});
