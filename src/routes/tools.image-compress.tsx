import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { compressImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-compress")!;

function Page() {
  const [quality, setQuality] = useState(70);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Compress"
      sidebar={
        <label className="block text-sm"><span className="font-medium">Quality: {quality}%</span>
          <input type="range" min={20} max={95} value={quality} onChange={(e) => setQuality(+e.target.value)} className="mt-1 w-full accent-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Lower = smaller file, higher = better quality.</p>
        </label>
      }
      process={async ([file]) => {
        const blob = await compressImage(file, quality / 100);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-compressed.jpg" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-compress")({
  head: () => ({ meta: [{ title: "Compress Image — Free | Pdfica" }, { name: "description", content: "Compress JPG, PNG, or WebP images in your browser." }] }),
  component: Page,
});
