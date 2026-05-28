import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UploadCloud, RotateCw, Trash2, Loader2, CheckCircle2, Download, GripVertical } from "lucide-react";
import { renderPageThumbs, organizePdf, type OrganizeOp } from "@/lib/pdf-tools";
import { downloadBlob, formatBytes } from "@/lib/format";

export const Route = createFileRoute("/tools/organize")({
  head: () => ({
    meta: [
      { title: "Organize PDF — Reorder, Rotate & Delete Pages | Pdfica" },
      { name: "description", content: "Visually reorder, rotate, or delete pages of your PDF, then download the result. Everything stays in your browser." },
      { property: "og:title", content: "Organize PDF — Pdfica" },
      { property: "og:description", content: "Drag-and-drop pages to reorganize your PDF, 100% private." },
    ],
  }),
  component: OrganizePage,
});

interface PageItem { id: string; index: number; rotation: number; thumb: string }

function SortablePage({ item, onRotate, onDelete }: {
  item: PageItem;
  onRotate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="group relative rounded-xl border bg-surface p-2 shadow-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
        <img
          src={item.thumb}
          alt={`Page ${item.index + 1}`}
          style={{ transform: `rotate(${item.rotation}deg)` }}
          className="h-full w-full object-contain transition-transform"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-medium">Page {item.index + 1}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onRotate} className="rounded-md p-1 hover:bg-muted" aria-label="Rotate">
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded-md p-1 text-destructive hover:bg-destructive/10" aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 rounded-md bg-surface/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Drag"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

function OrganizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    setError(null);
    renderPageThumbs(file)
      .then((thumbs) => {
        setItems(
          thumbs.map((t, i) => ({ id: `p-${i}-${Math.random().toString(36).slice(2, 6)}`, index: i, rotation: 0, thumb: t })),
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to read PDF."))
      .finally(() => setLoading(false));
  }, [file]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    setItems(arrayMove(items, oldIdx, newIdx));
  };

  const exportPdf = async () => {
    if (!file || !items.length) return;
    setBusy(true);
    setError(null);
    try {
      const ops: OrganizeOp = { pages: items.map((i) => ({ index: i.index, rotation: i.rotation })) };
      const blob = await organizePdf(file, ops);
      setResult(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setItems([]);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h2 className="font-display text-3xl font-bold">Organized!</h2>
        <p className="mt-1 text-sm text-muted-foreground">{formatBytes(result.size)}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => downloadBlob(result, (file?.name.replace(/\.pdf$/i, "") ?? "organized") + "-organized.pdf")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button onClick={reset} className="rounded-full border bg-surface px-6 py-3 text-sm font-semibold">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Organize PDF</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Drag pages to reorder, rotate, or delete them — then export your new PDF.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (!f) return;
            if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
              setError("Only PDF files are accepted.");
              return;
            }
            if (f.size > 25 * 1024 * 1024) {
              setError(`"${f.name}" is ${formatBytes(f.size)} — the maximum is 25 MB.`);
              return;
            }
            setError(null);
            setFile(f);
          }}
          className="rounded-3xl border-2 border-dashed bg-surface p-16 text-center"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-semibold">Drop a PDF</h3>
          <p className="mt-1 text-sm text-muted-foreground">Or click to browse</p>
          <p className="mt-2 text-xs text-muted-foreground/70">Max 25 MB per file</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 25 * 1024 * 1024) {
                setError(`"${f.name}" is ${formatBytes(f.size)} — the maximum is 25 MB.`);
                return;
              }
              setError(null);
              setFile(f);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Select PDF
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl shimmer-bg" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {items.length} page{items.length !== 1 ? "s" : ""} · drag to reorder
            </p>
            <div className="flex gap-2">
              <button onClick={reset} className="rounded-full border bg-surface px-4 py-2 text-sm font-medium hover:bg-muted">
                Choose another file
              </button>
              <button
                onClick={exportPdf}
                disabled={busy || !items.length}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Export PDF
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <AnimatePresence>
                  {items.map((it) => (
                    <SortablePage
                      key={it.id}
                      item={it}
                      onRotate={() =>
                        setItems((p) => p.map((x) => (x.id === it.id ? { ...x, rotation: (x.rotation + 90) % 360 } : x)))
                      }
                      onDelete={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
