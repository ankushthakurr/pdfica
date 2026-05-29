import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { cropImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-crop")!;

function Page() {
  const [margin, setMargin] = useState(10);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Crop"
      sidebar={
        <label className="block text-sm"><span className="font-medium">Margin to trim: {margin}%</span>
          <input type="range" min={0} max={40} value={margin} onChange={(e) => setMargin(+e.target.value)} className="mt-1 w-full accent-primary" />
        </label>
      }
      process={async ([file]) => {
        const blob = await cropImage(file, margin);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-cropped." + (file.type === "image/png" ? "png" : "jpg") };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-crop")({
  head: () => ({ meta: [{ title: "Crop Image — Free | Pdfica" }, { name: "description", content: "Crop image margins in your browser." }] }),
  component: Page,
});
