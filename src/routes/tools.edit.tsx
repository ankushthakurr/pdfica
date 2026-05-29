import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { editPdfAddText } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("edit")!;

function Page() {
  const [text, setText] = useState("Approved");
  const [page, setPage] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [size, setSize] = useState(18);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Apply"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block"><span className="font-medium">Text</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="block"><span className="font-medium">Page #</span>
            <input type="number" min={1} value={page} onChange={(e) => setPage(+e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="block"><span className="font-medium">X position: {x}%</span>
            <input type="range" min={0} max={100} value={x} onChange={(e) => setX(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
          <label className="block"><span className="font-medium">Y position from top: {y}%</span>
            <input type="range" min={0} max={100} value={y} onChange={(e) => setY(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
          <label className="block"><span className="font-medium">Size: {size}pt</span>
            <input type="range" min={8} max={72} value={size} onChange={(e) => setSize(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
        </div>
      }
      process={async ([file]) => {
        const blob = await editPdfAddText(file, text, page, x, y, size);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-edited.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/edit")({
  head: () => ({ meta: [{ title: "Edit PDF — Add Text | Pdfica" }, { name: "description", content: "Place text on any PDF page with full position control." }] }),
  component: Page,
});
