import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { csvToJson } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("csv-to-json")!;

export const Route = createFileRoute("/tools/csv-to-json")({
  head: () => ({ meta: [{ title: "CSV to JSON — Free | Pdfica" }, { name: "description", content: "Convert CSV rows to a JSON array." },
      { property: "og:title", content: "CSV to JSON — Free | Pdfica" },
      { property: "og:description", content: "Convert CSV rows to a JSON array." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await csvToJson(file);
        return { blob, filename: file.name.replace(/\.csv$/i, "") + ".json" };
      }} />
  ),
});
