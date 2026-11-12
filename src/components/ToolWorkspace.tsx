import { useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Download, AlertTriangle, Sparkles } from "lucide-react";
import { formatBytes, deliverFile } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { convertSequentially, prepareArchive, type OutputFile } from "@/lib/batch";
import { ResultImages } from "@/components/ResultImages";

export type ToolResult = OutputFile | null;
export type FileReporter = (index: number, phase: string, pct?: number) => void;

interface Props {
  title: string;
  description: string;
  accept: string;
  multi: boolean;
  /** Combine inputs together; false converts each independently. */
  batch?: boolean;
  cta?: string;
  /** Auto-start processing as soon as valid files are dropped/selected. Defaults to true for single-file tools. */
  autoProcess?: boolean;
  sidebar?: ReactNode;
  emptyHint?: string;
  maxSizeBytes?: number; // per-file limit; default 25 MB
  maxFiles?: number; // for multi tools
  // Returns a blob + filename (or null to keep state). Second arg lets the tool
  // report per-file progress: report(index, phase, pct?).
  process: (files: File[], report: FileReporter) => Promise<ToolResult>;
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

function getFileTypeLabel(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "PDF",
    ".docx": "Word document",
    ".jpg": "JPEG image",
    ".jpeg": "JPEG image",
    ".png": "PNG image",
    ".webp": "WebP image",
  };
  return map[ext.toLowerCase()] ?? ext.toUpperCase().replace(".", "") + " file";
}

export function ToolWorkspace({
  title,
  description,
  accept,
  multi,
  batch = !multi,
  cta = "Process files",
  autoProcess,
  sidebar,
  emptyHint,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  maxFiles,
  process,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [fileProgress, setFileProgress] = useState<Array<{ phase: string; pct: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoOn = autoProcess ?? (batch && !sidebar);
  const multiple = batch || multi;
  const limit = maxFiles ?? (batch ? 100 : undefined);
  const running = useRef(false);
  const reducedMotion = useReducedMotion();
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  useEffect(() => { if (inputRef.current && !files.length) inputRef.current.value = ""; }, [files.length]);

  const accepted = accept.split(",").map((s) => s.trim());

  const isAccepted = (f: File) =>
    accepted.some((a) =>
      a.startsWith(".") ? f.name.toLowerCase().endsWith(a.toLowerCase()) :
      f.type === a || a === "*/*" || (a.endsWith("/*") && f.type.startsWith(a.slice(0, -1))) ||
      ({ "application/pdf": ["pdf"], "image/png": ["png"], "image/jpeg": ["jpg", "jpeg"], "image/webp": ["webp"] }[a]?.includes(f.name.split(".").pop()?.toLowerCase() ?? "") ?? false),
    );

  const validateFiles = (list: File[]): { ok: File[]; errors: string[] } => {
    const errors: string[] = [];
    const ok: File[] = [];

    for (const f of list) {
      if (!isAccepted(f)) {
        const ext = f.name.slice(f.name.lastIndexOf("."));
        const label = getFileTypeLabel(ext);
        errors.push(`"${f.name}" is a ${label} — only ${accepted.map(a => a.replace(/^\./, "").toUpperCase()).join(", ")} files are accepted here.`);
        continue;
      }
      if (!f.size) { errors.push(`"${f.name}" is empty.`); continue; }
      if (f.size > maxSizeBytes) {
        errors.push(`"${f.name}" is ${formatBytes(f.size)} — the maximum is ${formatBytes(maxSizeBytes)} per file.`);
        continue;
      }
      ok.push(f);
    }

    if (multiple && limit && ok.length > limit) {
      errors.push(`You can upload up to ${limit} files. You selected ${ok.length}.`);
      return { ok: [], errors };
    }

    return { ok, errors };
  };

  const runProcess = useCallback(
    async (toRun: File[]) => {
      if (running.current || !toRun.length) return;
      running.current = true;
      setBusy(true);
      setOutputs([]);
      setError(null);
      setResult(null);
      setPhase("Reading file…");
      setElapsed(0);
      setFileProgress(toRun.map(() => ({ phase: "Queued", pct: 0 })));
      const t0 = performance.now();
      const tick = window.setInterval(() => setElapsed(performance.now() - t0), 100);
      const phaseTimer = window.setTimeout(() => setPhase("Processing…"), 350);
      const report: FileReporter = (index, p, pct) => {
        setFileProgress((prev) => {
          if (index < 0 || index >= prev.length) return prev;
          const next = prev.slice();
          next[index] = { phase: p, pct: pct ?? next[index].pct };
          return next;
        });
      };
      try {
        let r: ToolResult;
        if (batch) {
          const converted = await convertSequentially(toRun, (file, perFileReport) => process([file], perFileReport), report);
          setOutputs(converted.outputs);
          if (converted.errors.length) setError(converted.errors.join(" "));
          setPhase("Preparing download…");
          r = await prepareArchive(converted.outputs);
        } else {
          r = await process(toRun, report);
          if (r) { setOutputs([r]); toRun.forEach((_, i) => report(i, "Done", 100)); }
        }
        if (r) {
          setPhase("Finalizing…");
          setResult(r);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        clearInterval(tick);
        clearTimeout(phaseTimer);
        running.current = false;
        setBusy(false);
        setPhase("");
      }
    },
    [process, batch],
  );

  const handleFiles = useCallback(
    (list: FileList | File[]) => {
      if (running.current) return;
      const { ok, errors } = validateFiles(Array.from(list));
      if (errors.length) {
        setError(errors.join(" "));
        if (!ok.length) return;
      } else {
        setError(null);
      }
      setResult(null);
      const next = (() => {
        if (!multiple) return ok.slice(0, 1);
        const combined = [...files, ...ok];
        return combined;
      })();
      if (limit && next.length > limit) { setError(`You can upload up to ${limit} files per batch.`); return; }
      setFiles(next);
      setFileProgress([]);
      setOutputs([]);
      if (autoOn && next.length && !errors.length) {
        // Kick off processing immediately — no extra click needed.
        void runProcess(next);
      }
    },
    [multi, maxFiles, maxSizeBytes, accept, files, autoOn, runProcess],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const run = async () => {
    if (!files.length) return;
    const { ok, errors } = validateFiles(files);
    if (errors.length || !ok.length) {
      setError(errors.join(" ") || "One or more files failed validation.");
      return;
    }
    await runProcess(ok);
  };



  const reset = () => {
    if (running.current) return;
    setFiles([]);
    setOutputs([]);
    setFileProgress([]);
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
              className={`relative rounded-lg border-2 border-dashed p-10 md:p-16 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border bg-surface"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={busy}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <motion.div
                animate={{ y: dragOver ? -6 : 0 }}
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-lg bg-primary/10 text-primary"
              >
                <UploadCloud className="h-8 w-8" />
              </motion.div>
              <h3 className="font-display text-2xl font-semibold">Drop {multiple ? "files" : "a file"} here</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyHint ?? `Or click to browse your device. ${multiple ? "Multiple files allowed." : ""}`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Max {formatBytes(maxSizeBytes)} per file
                {multiple && limit ? ` · up to ${limit} files` : ""}
                {multiple && !limit ? " · multiple files allowed" : ""}
              </p>
              <Button
                disabled={busy} onClick={() => inputRef.current?.click()}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              >
                Select {multiple ? "files" : "file"}
              </Button>
            </motion.div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="rounded-lg border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length > 1 ? "s" : ""} {busy ? "in queue" : result ? "processed" : "ready"}
                </p>
                <Button disabled={busy} variant="ghost" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </Button>
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
                        <p className="text-xs text-muted-foreground">{formatBytes(f.size)} · {fileProgress[i]?.phase ?? "Ready"}</p>
                      </div>
                      <Button
                        disabled={busy} variant="ghost" size="icon" onClick={() => { setFiles((p) => p.filter((_, idx) => idx !== i)); setResult(null); setOutputs([]); setFileProgress([]); }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {/* Progress indicator */}
          <AnimatePresence>
            {busy && !result && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border bg-surface p-4"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    {phase || "Working…"}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {(elapsed / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
                    animate={reducedMotion ? undefined : { x: ["-100%", "300%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                {multiple && fileProgress.length > 1 && (
                  <ul className="mt-4 space-y-2.5">
                    {files.map((f, i) => {
                      const fp = fileProgress[i] ?? { phase: "Queued", pct: 0 };
                      const done = fp.phase.toLowerCase() === "done" || fp.pct >= 100;
                      return (
                        <li key={f.name + i} className="text-xs">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="truncate font-medium text-foreground">{f.name}</span>
                            <span className={`tabular-nums ${done ? "text-success" : "text-muted-foreground"}`}>
                              {done ? "Done" : fp.phase}
                              {!done && fp.pct > 0 ? ` · ${Math.round(fp.pct)}%` : ""}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className={`h-full rounded-full ${done ? "bg-success" : "bg-primary"}`}
                              animate={{ width: `${done ? 100 : Math.max(4, fp.pct)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
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
                className="rounded-lg border bg-surface p-10 text-center shadow-card"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <h3 className="font-display text-2xl font-semibold">{outputs.length > 1 ? `${outputs.length} files ready` : "Done!"}</h3>
                {outputs.map((output, i) => output.images ? <ResultImages key={i} images={output.images} /> : null)}
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {result.filename} · {formatBytes(result.blob.size)}
                </p>
                {outputs.length > 1 && <ul className="mt-5 divide-y text-left">{outputs.map((output, i) => <li key={i} className="flex items-center justify-between gap-3 py-2"><span className="truncate text-sm">{output.filename}</span><Button variant="ghost" size="icon" aria-label={`Download ${output.filename}`} onClick={() => void deliverFile(output.blob, output.filename)}><Download /></Button></li>)}</ul>}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => void deliverFile(result.blob, result.filename)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"
                  >
                    <Download className="h-4 w-4" /> {outputs.length > 1 ? "Download all (ZIP)" : "Download"}
                  </Button>
                  <Button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Start over
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process button */}
          {!result && (
            <div className="flex justify-end">
              <Button
                disabled={!files.length || busy}
                onClick={run}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.03] transition-transform"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Working..." : cta}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <fieldset disabled={busy} className="border-t py-5">
            <h4 className="font-display text-base font-semibold mb-3">Options</h4>
            {sidebar ?? <p className="text-sm text-muted-foreground">No options needed — just drop your file.</p>}
          </fieldset>
          <div className="mt-4 rounded-lg border bg-gradient-to-br from-primary/10 to-transparent p-5 text-sm">
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
