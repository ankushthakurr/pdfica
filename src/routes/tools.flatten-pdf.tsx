import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { flattenPdf } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("flatten-pdf")!;

export const Route = createFileRoute("/tools/flatten-pdf")({
  head: () => ({ meta: [{ title: "Flatten PDF — Free | Pdfica" }, { name: "description", content: "Flatten forms, annotations and layers by rasterizing each page." },
      { property: "og:title", content: "Flatten PDF — Free | Pdfica" },
      { property: "og:description", content: "Flatten forms, annotations and layers by rasterizing each page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Flatten"
      process={async ([file]) => {
        const blob = await flattenPdf(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-flat.pdf" };
      }} />
  ),
});
