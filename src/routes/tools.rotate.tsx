import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { rotatePdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("rotate")!;

function Page() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [ranges, setRanges] = useState("");
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false}
      cta="Rotate"
      sidebar={
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium block mb-2">Rotation</span>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map((a) => (
                <button key={a} onClick={() => setAngle(a)} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${angle === a ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}>{a}°</button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="font-medium">Pages (blank = all)</span>
            <input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3,5" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
        </div>
      }
      process={async ([file]) => {
        const blob = await rotatePdf(file, angle, ranges);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-rotated.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/rotate")({
  head: () => ({ meta: [{ title: "Rotate PDF — Free Online | Pdfica" }, { name: "description", content: "Rotate all or selected pages of a PDF in your browser." }] }),
  component: Page,
});
