import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { mergePdfs } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("merge")!;

export const Route = createFileRoute("/tools/merge")({
  head: () => ({
    meta: [
      { title: "Merge PDF — Combine PDFs Free in Your Browser | Pdfica" },
      { name: "description", content: "Free online PDF merger. Combine multiple PDFs into one file in seconds. No upload, no signup — runs entirely in your browser." },
      { property: "og:title", content: "Merge PDF — Pdfica" },
      { property: "og:description", content: "Combine multiple PDFs into one. 100% private, 100% free." },
    ],
  }),
  component: () => (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi
      cta="Merge PDFs"
      emptyHint="Drop two or more PDFs to combine them in order."
      process={async (files) => {
        if (files.length < 2) throw new Error("Add at least two PDFs to merge.");
        const blob = await mergePdfs(files);
        return { blob, filename: "merged.pdf" };
      }}
    />
  ),
});
