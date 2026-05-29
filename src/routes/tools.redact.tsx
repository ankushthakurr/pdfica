import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { redactPdf, type RedactBox } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";
import { Plus, Trash2 } from "lucide-react";

const tool = getTool("redact")!;

function Page() {
  const [boxes, setBoxes] = useState<RedactBox[]>([{ page: 1, xPct: 10, yPct: 10, wPct: 30, hPct: 5 }]);
  const update = (i: number, patch: Partial<RedactBox>) => setBoxes((bs) => bs.map((b, idx) => idx === i ? { ...b, ...patch } : b));
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Apply redactions"
      sidebar={
        <div className="space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">Coordinates are percentages of the page. (0,0) is top-left.</p>
          {boxes.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs">Box #{i + 1}</span>
                <button onClick={() => setBoxes((bs) => bs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">Page<input type="number" min={1} value={b.page} onChange={(e) => update(i, { page: +e.target.value })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs">X %<input type="number" value={b.xPct} onChange={(e) => update(i, { xPct: +e.target.value })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs">Y %<input type="number" value={b.yPct} onChange={(e) => update(i, { yPct: +e.target.value })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs">Width %<input type="number" value={b.wPct} onChange={(e) => update(i, { wPct: +e.target.value })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-sm" /></label>
                <label className="text-xs">Height %<input type="number" value={b.hPct} onChange={(e) => update(i, { hPct: +e.target.value })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-sm" /></label>
              </div>
            </motion.div>
          ))}
          <button onClick={() => setBoxes((bs) => [...bs, { page: 1, xPct: 10, yPct: 10, wPct: 30, hPct: 5 }])}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted w-full justify-center">
            <Plus className="h-3.5 w-3.5" /> Add box
          </button>
        </div>
      }
      process={async ([file]) => {
        const blob = await redactPdf(file, boxes);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-redacted.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/redact")({
  head: () => ({ meta: [{ title: "Redact PDF — Free Online | Pdfica" }, { name: "description", content: "Black out sensitive areas of a PDF before sharing." }] }),
  component: Page,
});
