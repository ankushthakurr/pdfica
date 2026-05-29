import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { rotateImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-rotate")!;

function Page() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Rotate"
      sidebar={
        <div className="space-y-2 text-sm">
          <span className="font-medium block">Rotation</span>
          {([90, 180, 270] as const).map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={angle === a} onChange={() => setAngle(a)} className="accent-primary" />
              <span>{a}°</span>
            </label>
          ))}
        </div>
      }
      process={async ([file]) => {
        const blob = await rotateImage(file, angle);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-rotated." + (file.type === "image/png" ? "png" : "jpg") };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-rotate")({
  head: () => ({ meta: [{ title: "Rotate Image — Free | Pdfica" }, { name: "description", content: "Rotate images 90, 180 or 270 degrees in your browser." }] }),
  component: Page,
});
