import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { splitPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("split")!;

function SplitPage() {
  const [ranges, setRanges] = useState("");
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Split PDF"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="font-medium">Page ranges</span>
            <input
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-3,5,7-9"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Leave blank to split every page into its own PDF (delivered as a ZIP).
          </p>
        </div>
      }
      process={async ([file]) => splitPdf(file, ranges)}
    />
  );
}

export const Route = createFileRoute("/tools/split")({
  head: () => ({
    meta: [
      { title: "Split PDF — Extract Pages Free | Pdfica" },
      { name: "description", content: "Split a PDF by page ranges or extract each page as a separate file. Runs entirely in your browser." },
      { property: "og:title", content: "Split PDF — Pdfica" },
      { property: "og:description", content: "Extract pages or split a PDF into parts. 100% private." },
    ],
  }),
  component: SplitPage,
});
