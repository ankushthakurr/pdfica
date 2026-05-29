import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { resizeImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-resize")!;

function Page() {
  const [w, setW] = useState(1280);
  const [h, setH] = useState(1280);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Resize"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block"><span className="font-medium">Max width (px)</span>
            <input type="number" min={16} value={w} onChange={(e) => setW(+e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="block"><span className="font-medium">Max height (px)</span>
            <input type="number" min={16} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <p className="text-xs text-muted-foreground">Aspect ratio is preserved automatically.</p>
        </div>
      }
      process={async ([file]) => {
        const blob = await resizeImage(file, w, h);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-resized." + (file.type === "image/png" ? "png" : "jpg") };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-resize")({
  head: () => ({ meta: [{ title: "Resize Image — Free | Pdfica" }, { name: "description", content: "Resize images to a target size in your browser." }] }),
  component: Page,
});
