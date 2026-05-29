import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { addPageNumbers, type NumberPosition } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("page-numbers")!;
const POS: NumberPosition[] = ["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"];

function Page() {
  const [pos, setPos] = useState<NumberPosition>("bottom-center");
  const [fmt, setFmt] = useState<"1" | "1/n" | "Page 1 of n">("1");
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Add numbers"
      sidebar={
        <div className="space-y-4 text-sm">
          <div>
            <span className="font-medium block mb-2">Position</span>
            <div className="grid grid-cols-3 gap-1.5">
              {POS.map((p) => (
                <button key={p} onClick={() => setPos(p)} className={`rounded-md border px-2 py-2 text-[10px] font-semibold ${pos === p ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>{p.replace("-", " ")}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium block mb-2">Format</span>
            {(["1","1/n","Page 1 of n"] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer py-1">
                <input type="radio" checked={fmt === f} onChange={() => setFmt(f)} className="accent-primary" />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
      }
      process={async ([file]) => {
        const blob = await addPageNumbers(file, pos, fmt);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-numbered.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/page-numbers")({
  head: () => ({ meta: [{ title: "Add Page Numbers to PDF — Free | Pdfica" }, { name: "description", content: "Add page numbers to every page of a PDF with custom format and position." }] }),
  component: Page,
});
