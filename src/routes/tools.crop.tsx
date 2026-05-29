import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { cropPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("crop")!;

function Page() {
  const [margin, setMargin] = useState(5);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Crop"
      sidebar={
        <label className="block text-sm"><span className="font-medium">Margin to trim: {margin}%</span>
          <input type="range" min={0} max={25} value={margin} onChange={(e) => setMargin(+e.target.value)} className="mt-1 w-full accent-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Trims an equal percentage from all four sides of every page.</p>
        </label>
      }
      process={async ([file]) => {
        const blob = await cropPdf(file, margin);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-cropped.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/crop")({
  head: () => ({ meta: [{ title: "Crop PDF — Free Online | Pdfica" }, { name: "description", content: "Trim margins from every page of a PDF in your browser." }] }),
  component: Page,
});
