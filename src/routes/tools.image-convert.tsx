import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { convertImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-convert")!;

function Page() {
  const [target, setTarget] = useState<"image/jpeg" | "image/png" | "image/webp">("image/webp");
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[target];
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      sidebar={
        <div className="space-y-2 text-sm">
          <span className="font-medium block">Target format</span>
          {(["image/jpeg", "image/png", "image/webp"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={target === t} onChange={() => setTarget(t)} className="accent-primary" />
              <span>{t.split("/")[1].toUpperCase()}</span>
            </label>
          ))}
        </div>
      }
      process={async ([file]) => {
        const blob = await convertImage(file, target);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "." + ext };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-convert")({
  head: () => ({ meta: [{ title: "Convert Image — JPG, PNG, WebP | Pdfica" }, { name: "description", content: "Convert images between JPG, PNG and WebP in your browser." }] }),
  component: Page,
});
