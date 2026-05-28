import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { imagesToPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("jpg-to-pdf")!;

function JpgToPdfPage() {
  const [size, setSize] = useState<"fit" | "a4">("a4");
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi
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
      process={async (files) => {
        const blob = await imagesToPdf(files, size);
        return { blob, filename: "images.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/jpg-to-pdf")({
  head: () => ({
    meta: [
      { title: "JPG to PDF — Combine Images into a PDF | Pdfica" },
      { name: "description", content: "Combine multiple JPG, PNG, or WebP images into a single PDF document in your browser." },
      { property: "og:title", content: "JPG to PDF — Pdfica" },
      { property: "og:description", content: "Merge images into a single PDF document, free and private." },
    ],
  }),
  component: JpgToPdfPage,
});
