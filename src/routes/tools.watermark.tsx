import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { addWatermark } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("watermark")!;

function Page() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [size, setSize] = useState(64);
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Stamp watermark"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block"><span className="font-medium">Text</span>
            <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="block"><span className="font-medium">Opacity: {Math.round(opacity * 100)}%</span>
            <input type="range" min={5} max={100} value={opacity * 100} onChange={(e) => setOpacity(+e.target.value / 100)} className="mt-1 w-full accent-primary" />
          </label>
          <label className="block"><span className="font-medium">Angle: {angle}°</span>
            <input type="range" min={0} max={90} value={angle} onChange={(e) => setAngle(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
          <label className="block"><span className="font-medium">Size: {size}pt</span>
            <input type="range" min={20} max={140} value={size} onChange={(e) => setSize(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
        </div>
      }
      process={async ([file]) => {
        const blob = await addWatermark(file, text, opacity, angle, size);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-watermarked.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/watermark")({
  head: () => ({ meta: [{ title: "Watermark PDF — Free Online | Pdfica" }, { name: "description", content: "Add a customizable text watermark to every PDF page." }] }),
  component: Page,
});
