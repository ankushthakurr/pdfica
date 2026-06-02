import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { imagesToPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-to-pdf")!;

function Page() {
  const [size, setSize] = useState<"fit" | "a4">("a4");
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi
      maxFiles={30}
      maxSizeBytes={15 * 1024 * 1024}
      cta="Build PDF"
      sidebar={
        <div className="space-y-3 text-sm">
          <span className="font-medium block">Page size</span>
          {(["a4", "fit"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pagesize"
                checked={size === opt}
                onChange={() => setSize(opt)}
                className="accent-primary"
              />
              <span>{opt === "a4" ? "A4 (with margin)" : "Fit to image"}</span>
            </label>
          ))}
        </div>
      }
      process={async (files, report) => {
        const blob = await imagesToPdf(files, size, report);
        return { blob, filename: "images.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/image-to-pdf")({
  head: () => ({
    meta: [
      { title: "Image to PDF — Combine JPG, PNG, WebP into a PDF | Pdfica" },
      { name: "description", content: "Combine any JPG, PNG or WebP images into a single PDF document. Drag-and-drop, free, private, runs in your browser." },
      { property: "og:title", content: "Image to PDF — Pdfica" },
      { property: "og:description", content: "Merge images into a single PDF document, free and private." },
    ],
  }),
  component: Page,
});
