import { useCallback, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Download, AlertTriangle } from "lucide-react";
import { formatBytes, downloadBlob } from "@/lib/format";

export type ToolResult = { blob: Blob; filename: string } | null;

interface Props {
  title: string;
  description: string;
  accept: string;
  multi: boolean;
  cta?: string;
  sidebar?: ReactNode;
  emptyHint?: string;
  maxSizeBytes?: number; // per-file limit; default 25 MB
  maxFiles?: number; // for multi tools
  // Returns a blob + filename (or null to keep state).
  process: (files: File[]) => Promise<ToolResult>;
}

export function ToolWorkspace({
  title,
  description,
  accept,
  multi,
  cta = "Process files",
  sidebar,
  emptyHint,
  process,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accepted = accept.split(",").map((s) => s.trim());
  const isAccepted = (f: File) =>
    accepted.some((a) =>
      a.startsWith(".") ? f.name.toLowerCase().endsWith(a) : f.type === a || a === "*/*",
    );

  const handleFiles = useCallback(
    (list: FileList | File[]) => {
      const arr = Array.from(list).filter(isAccepted);
      if (!arr.length) {
        setError("That file type isn't supported here.");
        return;
      }
      setError(null);
      setResult(null);
      setFiles((prev) => (multi ? [...prev, ...arr] : arr.slice(0, 1)));
    },
    [multi],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const run = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await process(files);
      if (r) setResult(r);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Drop zone */}
          {!result && (
            <motion.div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              animate={{ scale: dragOver ? 1.01 : 1 }}
              className={`relative rounded-3xl border-2 border-dashed p-10 md:p-16 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border bg-surface"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multi}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <motion.div
                animate={{ y: dragOver ? -6 : 0 }}
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"
              >
                <UploadCloud className="h-8 w-8" />
              </motion.div>
              <h3 className="font-display text-2xl font-semibold">Drop {multi ? "files" : "a file"} here</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyHint ?? `Or click to browse your device. ${multi ? "Multiple files allowed." : ""}`}
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              >
                Select {multi ? "files" : "file"}
              </button>
            </motion.div>
          )}

          {/* File list */}
          {files.length > 0 && !result && (
            <div className="rounded-2xl border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length > 1 ? "s" : ""} ready
                </p>
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </div>
              <ul className="divide-y">
                <AnimatePresence initial={false}>
                  {files.map((f, i) => (
                    <motion.li
                      key={f.name + i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                      </div>
                      <button
                        onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border bg-surface p-10 text-center shadow-card"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <h3 className="font-display text-2xl font-semibold">Done!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.filename} · {formatBytes(result.blob.size)}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => downloadBlob(result.blob, result.filename)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"
                  >
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Start over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process button */}
          {!result && (
            <div className="flex justify-end">
              <button
                disabled={!files.length || busy}
                onClick={run}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.03] transition-transform"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Working..." : cta}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-surface p-5">
            <h4 className="font-display text-base font-semibold mb-3">Options</h4>
            {sidebar ?? <p className="text-sm text-muted-foreground">No options needed — just drop your file.</p>}
          </div>
          <div className="mt-4 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 text-sm">
            <p className="font-semibold">🔒 100% private</p>
            <p className="mt-1 text-muted-foreground">
              Your files are processed entirely on your device. We never upload, store, or see them.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
