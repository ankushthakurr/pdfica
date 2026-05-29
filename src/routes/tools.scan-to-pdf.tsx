import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scanToPdf } from "@/lib/pdf-tools";
import { downloadBlob } from "@/lib/format";
import { Camera, Loader2, Download, AlertTriangle, Trash2, RefreshCw } from "lucide-react";

function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
      } catch {
        setError("Could not access your camera. Check permissions and try again.");
      }
    })();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    setPages((p) => [...p, canvas.toDataURL("image/jpeg", 0.92)]);
  };

  const build = async () => {
    setBusy(true); setError(null); setBlob(null);
    try { setBlob(await scanToPdf(pages)); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Scan to PDF</h1>
        <p className="mt-3 text-muted-foreground">Use your device camera to scan pages into a single PDF.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border bg-black aspect-[4/3]">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            {!streaming && (
              <div className="absolute inset-0 grid place-items-center text-white/70 text-sm">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button onClick={capture} disabled={!streaming}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 enabled:hover:scale-[1.03] transition-transform">
              <Camera className="h-4 w-4" /> Capture page
            </button>
          </div>

          <AnimatePresence>
            {pages.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border bg-surface p-4">
                <p className="mb-3 text-sm font-medium">{pages.length} page{pages.length > 1 ? "s" : ""} captured</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {pages.map((src, i) => (
                    <motion.div key={i} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative group">
                      <img src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg border" />
                      <button onClick={() => setPages((p) => p.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setPages([])} className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold hover:bg-muted">
                    <RefreshCw className="h-3.5 w-3.5" /> Clear all
                  </button>
                  <button onClick={build} disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Build PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {blob && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
              <button onClick={() => downloadBlob(blob, "scan.pdf")}
                className="inline-flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-semibold text-white hover:scale-[1.03] transition-transform">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </motion.div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 text-sm">
            <p className="font-semibold">📷 Camera is on-device</p>
            <p className="mt-1 text-muted-foreground">Camera frames stay in your browser. Nothing is ever uploaded.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tools/scan-to-pdf")({
  head: () => ({ meta: [{ title: "Scan to PDF — Free | Pdfica" }, { name: "description", content: "Use your device camera to scan documents into a PDF." }] }),
  component: Page,
});
